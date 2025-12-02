"""
Optimized Agentic Itinerary Workflow - LangChain + LangGraph + LangSmith

Features:
- Token-optimized structured output
- Comprehensive tool calling for real data
- LangSmith tracing for debugging and monitoring
- Error recovery and fallback handling
- Caching-aware to reduce redundant API calls
"""

from __future__ import annotations

import json
import logging
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, TypedDict, Annotated

import yaml
from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)
from langchain_core.runnables import RunnableConfig
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages

from config import settings
from tools.travel_agent_tools import (
    get_weather_report,
    search_places,
    get_flight_info,
    estimate_costs,
)

LOGGER = logging.getLogger(__name__)

# Initialize LangSmith tracing
def _setup_langsmith() -> bool:
    """Configure LangSmith tracing if API key is available."""
    try:
        if settings.langsmith_api_key:
            os.environ["LANGCHAIN_TRACING_V2"] = "true"
            os.environ["LANGCHAIN_API_KEY"] = settings.langsmith_api_key
            os.environ["LANGCHAIN_PROJECT"] = settings.langsmith_project or "safarbot"
            os.environ["LANGCHAIN_ENDPOINT"] = settings.langsmith_endpoint or "https://api.smith.langchain.com"
            LOGGER.info("LangSmith tracing enabled for project: %s", settings.langsmith_project)
            return True
        LOGGER.warning("LangSmith API key not configured - tracing disabled")
        return False
    except Exception as e:
        LOGGER.warning("LangSmith setup failed (tracing disabled): %s", str(e))
        # Disable tracing if setup fails
        os.environ.pop("LANGCHAIN_TRACING_V2", None)
        return False

_LANGSMITH_ENABLED = _setup_langsmith()


class PlannerState(TypedDict, total=False):
    """State schema for the itinerary planning workflow."""
    messages: Annotated[List[BaseMessage], add_messages]
    itinerary: Optional[Dict[str, Any]]
    weather: Optional[Dict[str, Any]]
    place_details: Dict[str, Dict[str, Any]]
    additional_places: Dict[str, List[Dict[str, Any]]]
    tool_call_count: int
    errors: List[str]
    request_params: Dict[str, Any]


def _load_prompt_template() -> Dict[str, str]:
    """Load YAML prompt template with caching."""
    prompt_path = Path(__file__).resolve().parent.parent / "prompts" / "itinerary_agent_prompt.yaml"
    with prompt_path.open("r", encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def _extract_text(message: AIMessage) -> str:
    """Normalize Gemini response to plain string."""
    if isinstance(message.content, str):
        return message.content
    if isinstance(message.content, list):
        return "".join(
            part.get("text", "") if isinstance(part, dict) else str(part)
            for part in message.content
        )
    return str(message.content)


def _parse_itinerary_json(text: str) -> Dict[str, Any]:
    """Extract and parse JSON from LLM response with error handling."""
    text = text.strip()
    
    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    
    # Try extracting JSON from markdown code block (```json ... ```)
    if "```json" in text.lower() or "``` json" in text.lower():
        # Match ```json or ``` json followed by optional newline and then content until ```
        pattern = r'```\s*json\s*\n(.*?)```'
        matches = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)
        if matches:
            for match in matches:
                try:
                    return json.loads(match.strip())
                except json.JSONDecodeError:
                    continue
        
        # Fallback: manual extraction
        start_marker = text.lower().find("```json")
        if start_marker == -1:
            start_marker = text.lower().find("``` json")
        if start_marker >= 0:
            # Find the start of actual JSON (after ```json and newline)
            json_start = text.find("\n", start_marker)
            if json_start == -1:
                json_start = text.find("{", start_marker)
            else:
                json_start += 1  # Skip the newline
            
            # Find the closing ```
            closing_marker = text.find("```", json_start)
            if closing_marker > json_start:
                json_text = text[json_start:closing_marker].strip()
                try:
                    return json.loads(json_text)
                except json.JSONDecodeError:
                    pass
    
    # Try extracting any JSON object (find first { to last })
    start = text.find("{")
    if start >= 0:
        # Find matching closing brace
        brace_count = 0
        end = start
        for i in range(start, len(text)):
            if text[i] == '{':
                brace_count += 1
            elif text[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    end = i + 1
                    break
        
        if end > start:
            try:
                return json.loads(text[start:end])
            except json.JSONDecodeError:
                pass
    
    LOGGER.error("Failed to parse itinerary JSON. First 500 chars: %s", text[:500])
    LOGGER.error("Last 200 chars: %s", text[-200:] if len(text) > 200 else text)
    raise ValueError("Invalid JSON response from AI model")


class AgenticItineraryWorkflow:
    """
    LangGraph workflow for generating travel itineraries with tool calling.
    
    Flow:
    1. Planner receives request and decides which tools to call
    2. Tools execute and return real data
    3. Planner incorporates tool data and generates itinerary
    4. Finalizer validates and returns structured output
    """

    MAX_TOOL_ITERATIONS = 5  # Prevent infinite loops

    def __init__(self) -> None:
        if not settings.google_api_key:
            raise ValueError("GOOGLE_API_KEY is required")

        self.prompt_template = _load_prompt_template()
        
        # Register tools
        self.tools = [get_weather_report, search_places, get_flight_info, estimate_costs]
        self.tool_registry = {tool.name: tool for tool in self.tools}

        # Initialize Gemini with optimized settings
        self.model = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.25,  # Lower for more consistent output
            max_output_tokens=4096,  # Enough for detailed itinerary
            top_p=0.9,
            safety_settings=None,
        )
        self.model_with_tools = self.model.bind_tools(self.tools)

        # Build workflow graph
        self.graph = self._build_graph()
        
        # LangSmith config
        self.langsmith_config: RunnableConfig = {
            "configurable": {"thread_id": "safarbot-itinerary"},
            "tags": ["itinerary-generation"],
            "metadata": {"service": "safarbot", "workflow": "itinerary"},
        }

    def _build_graph(self) -> StateGraph:
        """Construct the LangGraph workflow."""
        workflow = StateGraph(PlannerState)
        
        # Add nodes
        workflow.add_node("planner", self._planner_node)
        workflow.add_node("tools", self._tool_executor_node)
        workflow.add_node("finalize", self._finalize_node)
        
        # Set entry point
        workflow.set_entry_point("planner")
        
        # Add conditional routing
        workflow.add_conditional_edges(
            "planner",
            self._route_after_planner,
            {"tools": "tools", "finalize": "finalize"},
        )
        
        # Tools always return to planner for next decision
        workflow.add_edge("tools", "planner")
        
        # Finalize ends the workflow
        workflow.add_edge("finalize", END)
        
        return workflow.compile()

    async def _planner_node(self, state: PlannerState) -> PlannerState:
        """
        Core planning node - decides actions and generates content.
        """
        try:
            response = await self.model_with_tools.ainvoke(
                state["messages"],
                config=self.langsmith_config
            )
            state["messages"].append(response)
            
        except Exception as e:
            LOGGER.error("Planner node error: %s", str(e))
            state.setdefault("errors", []).append(f"Planner error: {str(e)}")
            # Create error message for recovery
            error_msg = AIMessage(content=json.dumps({
                "error": str(e),
                "fallback": True
            }))
            state["messages"].append(error_msg)
        
        return state

    def _route_after_planner(self, state: PlannerState) -> str:
        """
        Decide whether to execute tools or finalize output.
        """
        # Check iteration limit
        tool_count = state.get("tool_call_count", 0)
        if tool_count >= self.MAX_TOOL_ITERATIONS:
            LOGGER.warning("Max tool iterations reached, forcing finalization")
            return "finalize"
        
        last_msg = state["messages"][-1]
        
        # If AI wants to call tools, route to tool executor
        if isinstance(last_msg, AIMessage) and last_msg.tool_calls:
            return "tools"
        
        return "finalize"

    async def _tool_executor_node(self, state: PlannerState) -> PlannerState:
        """
        Execute tool calls and collect results.
        """
        last_msg = state["messages"][-1]
        tool_messages: List[ToolMessage] = []
        
        # Increment tool call counter
        state["tool_call_count"] = state.get("tool_call_count", 0) + 1
        
        for call in last_msg.tool_calls:
            tool_name = call["name"]
            tool_args = call["args"]
            tool_id = call["id"]
            
            LOGGER.info("Executing tool: %s with args: %s", tool_name, tool_args)
            
            tool = self.tool_registry.get(tool_name)
            if not tool:
                tool_messages.append(
                    ToolMessage(
                        content=json.dumps({"error": f"Unknown tool: {tool_name}"}),
                        tool_call_id=tool_id
                    )
                )
                continue

            try:
                result = await tool.ainvoke(tool_args)
                tool_messages.append(
                    ToolMessage(content=json.dumps(result), tool_call_id=tool_id)
                )
                
                # Store results in state for later use
                self._store_tool_result(state, tool_name, tool_args, result)
                
            except Exception as e:
                LOGGER.exception("Tool %s failed: %s", tool_name, str(e))
                error_result = {"error": str(e), "tool": tool_name}
                tool_messages.append(
                    ToolMessage(content=json.dumps(error_result), tool_call_id=tool_id)
                )
                state.setdefault("errors", []).append(f"Tool {tool_name} failed: {str(e)}")

        state["messages"].extend(tool_messages)
        return state

    def _store_tool_result(
        self,
        state: PlannerState,
        tool_name: str,
        args: Dict[str, Any],
        result: Any
    ) -> None:
        """
        Store tool results in appropriate state fields.
        """
        if tool_name == "get_weather_report" and isinstance(result, dict):
            state["weather"] = result
            
        elif tool_name == "search_places" and isinstance(result, dict):
            category = result.get("category", args.get("category", "general"))
            places = result.get("results", [])
            
            # Store in additional_places by category
            state.setdefault("additional_places", {})
            state["additional_places"].setdefault(category, []).extend(places)
            
            # Also index by place_id for quick lookup
            state.setdefault("place_details", {})
            for place in places:
                pid = place.get("place_id")
                if pid:
                    state["place_details"][pid] = place
                    
        elif tool_name == "estimate_costs" and isinstance(result, dict):
            state.setdefault("cost_estimate", result)
            
        elif tool_name == "get_flight_info" and isinstance(result, dict):
            state.setdefault("flight_options", result)

    async def _finalize_node(self, state: PlannerState) -> PlannerState:
        """
        Parse and validate the final itinerary output.
        """
        last_msg = state["messages"][-1]
        
        if not isinstance(last_msg, AIMessage):
            state.setdefault("errors", []).append("Final message not from AI")
            state["itinerary"] = self._generate_fallback_itinerary(state)
            return state

        try:
            text = _extract_text(last_msg)
            itinerary = _parse_itinerary_json(text)
            
            # Enrich with any missing data from tool results
            itinerary = self._enrich_itinerary(itinerary, state)
            
            state["itinerary"] = itinerary
            
        except Exception as e:
            LOGGER.error("Finalization failed: %s", str(e))
            state.setdefault("errors", []).append(f"Parse error: {str(e)}")
            state["itinerary"] = self._generate_fallback_itinerary(state)
        
        return state

    def _enrich_itinerary(
        self,
        itinerary: Dict[str, Any],
        state: PlannerState
    ) -> Dict[str, Any]:
        """
        Enrich itinerary with additional data from tool results.
        """
        # Add weather if not present
        if not itinerary.get("weather_summary") and state.get("weather"):
            weather = state["weather"]
            current = weather.get("current", {})
            itinerary["weather_summary"] = (
                f"{current.get('temperature', 'N/A')}°C, "
                f"{current.get('description', 'Check local forecast')}"
            )
        
        # Ensure metadata exists
        if "metadata" not in itinerary:
            itinerary["metadata"] = {}
        
        # Add place count info
        itinerary["metadata"]["places_sourced"] = len(state.get("place_details", {}))
        itinerary["metadata"]["categories_searched"] = list(state.get("additional_places", {}).keys())
        
        return itinerary

    def _generate_fallback_itinerary(self, state: PlannerState) -> Dict[str, Any]:
        """
        Generate a minimal fallback itinerary when AI fails.
        """
        params = state.get("request_params", {})
        destination = params.get("destination", "Unknown")
        total_days = params.get("total_days", 3)
        
        return {
            "destination": destination,
            "trip_summary": f"Basic {total_days}-day trip to {destination}",
            "total_days": total_days,
            "weather_summary": "Check local forecast",
            "budget_estimate": {
                "total": 0,
                "currency": "INR",
                "breakdown": {}
            },
            "daily_plans": [
                {
                    "day": i + 1,
                    "date": "",
                    "theme": "Exploration",
                    "activities": [],
                    "meals": [],
                    "transport": [],
                    "daily_cost": 0
                }
                for i in range(total_days)
            ],
            "metadata": {
                "tips": [
                    "Research local attractions before your trip",
                    "Book accommodations in advance",
                    "Check visa requirements",
                    "Purchase travel insurance",
                    "Keep copies of important documents"
                ],
                "fallback": True,
                "errors": state.get("errors", [])
            }
        }

    async def generate_complete_itinerary(
        self,
        *,
        destination: str,
        start_date: str,
        end_date: str,
        budget: Optional[float] = None,
        budget_range: Optional[str] = None,
        interests: List[str],
        travelers: int,
        travel_companion: Optional[str] = None,
        trip_pace: Optional[str] = None,
        departure_city: Optional[str] = None,
        flight_class_preference: Optional[str] = None,
        hotel_rating_preference: Optional[str] = None,
        accommodation_type: Optional[str] = None,
        email: Optional[str] = None,
        dietary_preferences: List[str],
        halal_preferences: Optional[str] = None,
        vegetarian_preferences: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Main entry point - generates complete itinerary with tool data.
        """
        # Calculate days
        total_days = max(1, self._calculate_days(start_date, end_date))
        
        # Build budget note
        if budget_range:
            budget_note = budget_range
        elif budget:
            budget_note = f"₹{budget:,.0f} INR total"
        else:
            budget_note = "Flexible budget"
        
        # Build accommodation preference
        accommodation_pref = (
            hotel_rating_preference or
            accommodation_type or
            "Mid-range"
        )
        
        # Compile dietary preferences
        dietary_list = dietary_preferences.copy() if dietary_preferences else []
        if halal_preferences:
            dietary_list.append(f"Halal: {halal_preferences}")
        if vegetarian_preferences:
            dietary_list.append(f"Vegetarian: {vegetarian_preferences}")
        
        # Format user prompt
        user_prompt = self.prompt_template["user"].format(
            destination=destination,
            start_date=start_date,
            end_date=end_date,
            total_days=total_days,
            travelers=travelers,
            travel_companion=travel_companion or "General",
            trip_pace=trip_pace or "Balanced",
            budget_note=budget_note,
            accommodation_preference=accommodation_pref,
            dietary_list=dietary_list or ["No restrictions"],
            interest_list=interests or ["General sightseeing"],
            departure_city=departure_city or "Not specified",
        )

        # Build system prompt with output schema
        system_prompt = self.prompt_template["system"]
        if "output_schema" in self.prompt_template:
            system_prompt += f"\n\nOUTPUT SCHEMA:\n{self.prompt_template['output_schema']}"

        # Initialize messages
        messages: List[BaseMessage] = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt),
        ]

        # Initialize state
        initial_state: PlannerState = {
            "messages": messages,
            "place_details": {},
            "additional_places": {},
            "tool_call_count": 0,
            "errors": [],
            "request_params": {
                "destination": destination,
                "start_date": start_date,
                "end_date": end_date,
                "total_days": total_days,
                "budget": budget,
                "interests": interests,
                "travelers": travelers,
            }
        }

        # Execute workflow
        LOGGER.info(
            "Starting itinerary generation: %s (%d days)",
            destination,
            total_days
        )
        
        final_state = await self.graph.ainvoke(
            initial_state,
            config=self.langsmith_config
        )

        # Return complete response
        return {
            "itinerary": final_state.get("itinerary", {}),
            "place_details": final_state.get("place_details", {}),
            "additional_places": final_state.get("additional_places", {}),
            "weather": final_state.get("weather"),
            "metadata": {
                "tool_calls": final_state.get("tool_call_count", 0),
                "errors": final_state.get("errors", []),
                "tracing_enabled": _LANGSMITH_ENABLED,
            }
        }

    @staticmethod
    def _calculate_days(start: str, end: str) -> int:
        """Calculate number of days between dates."""
        try:
            start_dt = datetime.strptime(start, "%Y-%m-%d")
            end_dt = datetime.strptime(end, "%Y-%m-%d")
            return (end_dt - start_dt).days + 1
        except ValueError:
            return 3  # Default fallback
