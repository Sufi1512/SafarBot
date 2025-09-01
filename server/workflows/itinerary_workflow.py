"""
LangGraph workflow for itinerary generation
"""

import json
import logging
from typing import Dict, Any, List, Optional, TypedDict
from datetime import datetime, timedelta

from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

from prompts.itinerary_prompts import (
    ITINERARY_GENERATION_PROMPT,
    PRICE_PREDICTION_PROMPT,
    WEATHER_ADVICE_PROMPT,
    format_budget_info,
    format_interests,
    format_accommodation_type
)
from models import ItineraryResponse, DailyPlan
from config import settings

logger = logging.getLogger(__name__)

class ItineraryState(TypedDict):
    """State for the itinerary generation workflow"""
    destination: str
    start_date: str
    end_date: str
    total_days: int
    travelers: int
    budget: Optional[float]
    interests: List[str]
    accommodation_type: Optional[str]
    
    # Generated content
    itinerary_data: Optional[Dict[str, Any]]
    price_prediction: Optional[Dict[str, Any]]
    weather_advice: Optional[str]
    
    # Workflow control
    error: Optional[str]
    retry_count: int
    final_response: Optional[ItineraryResponse]

class ItineraryWorkflow:
    """LangGraph workflow for generating travel itineraries"""
    
    def __init__(self):
        """Initialize the workflow with Google Gemini model"""
        self.llm = None
        if settings.google_api_key:
            try:
                self.llm = ChatGoogleGenerativeAI(
                    model="gemini-2.5-flash",
                    google_api_key=settings.google_api_key,
                    temperature=0.7,
                    max_tokens=8192
                )
                logger.info("Google Gemini LLM initialized for workflow")
            except Exception as e:
                logger.warning(f"Failed to initialize Google Gemini LLM: {str(e)}")
        
        # Build the workflow graph
        self.workflow = self._build_workflow()
    
    def _build_workflow(self) -> StateGraph:
        """Build the LangGraph workflow"""
        workflow = StateGraph(ItineraryState)
        
        # Add nodes
        workflow.add_node("validate_input", self._validate_input)
        workflow.add_node("generate_itinerary", self._generate_itinerary)
        workflow.add_node("predict_prices", self._predict_prices)
        workflow.add_node("get_weather_advice", self._get_weather_advice)
        workflow.add_node("compile_response", self._compile_response)
        workflow.add_node("handle_error", self._handle_error)
        
        # Set entry point
        workflow.set_entry_point("validate_input")
        
        # Add edges
        workflow.add_conditional_edges(
            "validate_input",
            self._should_continue_after_validation,
            {
                "continue": "generate_itinerary",
                "error": "handle_error"
            }
        )
        
        workflow.add_conditional_edges(
            "generate_itinerary",
            self._should_continue_after_generation,
            {
                "continue": "predict_prices",
                "retry": "generate_itinerary",
                "error": "handle_error"
            }
        )
        
        workflow.add_edge("predict_prices", "get_weather_advice")
        workflow.add_edge("get_weather_advice", "compile_response")
        workflow.add_edge("compile_response", END)
        workflow.add_edge("handle_error", END)
        
        return workflow.compile()
    
    async def generate_itinerary(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        budget: Optional[float] = None,
        interests: List[str] = None,
        travelers: int = 1,
        accommodation_type: Optional[str] = None
    ) -> ItineraryResponse:
        """Run the complete itinerary generation workflow"""
        
        # Calculate total days
        start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
        total_days = (end_date_obj - start_date_obj).days + 1
        
        # Initialize state
        initial_state: ItineraryState = {
            "destination": destination,
            "start_date": start_date,
            "end_date": end_date,
            "total_days": total_days,
            "travelers": travelers,
            "budget": budget,
            "interests": interests or [],
            "accommodation_type": accommodation_type,
            "itinerary_data": None,
            "price_prediction": None,
            "weather_advice": None,
            "error": None,
            "retry_count": 0,
            "final_response": None
        }
        
        try:
            # Run the workflow
            final_state = await self.workflow.ainvoke(initial_state)
            
            if final_state.get("error"):
                raise Exception(final_state["error"])
            
            if final_state.get("final_response"):
                return final_state["final_response"]
            else:
                raise Exception("Workflow completed but no response generated")
                
        except Exception as e:
            logger.error(f"Workflow execution failed: {str(e)}")
            # Return fallback itinerary
            return await self._generate_fallback_itinerary(
                destination, start_date, end_date, budget, interests or [], travelers, accommodation_type
            )
    
    async def _validate_input(self, state: ItineraryState) -> ItineraryState:
        """Validate input parameters"""
        try:
            # Check required fields
            if not state["destination"]:
                state["error"] = "Destination is required"
                return state
            
            if not state["start_date"] or not state["end_date"]:
                state["error"] = "Start and end dates are required"
                return state
            
            # Validate dates
            start_date_obj = datetime.strptime(state["start_date"], '%Y-%m-%d').date()
            end_date_obj = datetime.strptime(state["end_date"], '%Y-%m-%d').date()
            
            if start_date_obj >= end_date_obj:
                state["error"] = "End date must be after start date"
                return state
            
            if state["total_days"] > 30:
                state["error"] = "Maximum trip duration is 30 days"
                return state
            
            if state["travelers"] < 1 or state["travelers"] > 20:
                state["error"] = "Number of travelers must be between 1 and 20"
                return state
            
            logger.info(f"Input validation passed for {state['destination']}")
            return state
            
        except Exception as e:
            state["error"] = f"Input validation failed: {str(e)}"
            return state
    
    async def _generate_itinerary(self, state: ItineraryState) -> ItineraryState:
        """Generate the main itinerary using AI"""
        if not self.llm:
            state["error"] = "AI service not available"
            return state
        
        try:
            # Prepare prompt variables
            prompt_vars = {
                "destination": state["destination"],
                "total_days": state["total_days"],
                "start_date": state["start_date"],
                "end_date": state["end_date"],
                "travelers": state["travelers"],
                "budget_info": format_budget_info(state["budget"]),
                "interests": format_interests(state["interests"]),
                "accommodation_type": format_accommodation_type(state["accommodation_type"])
            }
            
            # Generate content using the prompt template
            messages = ITINERARY_GENERATION_PROMPT.format_messages(**prompt_vars)
            response = await self.llm.ainvoke(messages)
            
            # Parse JSON response
            cleaned_text = self._clean_json_response(response.content)
            itinerary_data = json.loads(cleaned_text)
            
            # Validate the response structure
            if not self._validate_itinerary_structure(itinerary_data):
                raise ValueError("Invalid itinerary structure received")
            
            state["itinerary_data"] = itinerary_data
            logger.info(f"Itinerary generated successfully for {state['destination']}")
            return state
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing failed: {str(e)}")
            state["retry_count"] += 1
            if state["retry_count"] < 3:
                return state  # Will retry
            else:
                state["error"] = "Failed to generate valid itinerary after retries"
                return state
                
        except Exception as e:
            logger.error(f"Itinerary generation failed: {str(e)}")
            state["error"] = f"Failed to generate itinerary: {str(e)}"
            return state
    
    async def _predict_prices(self, state: ItineraryState) -> ItineraryState:
        """Predict travel costs"""
        if not self.llm:
            # Skip price prediction if AI not available
            logger.warning("AI not available for price prediction")
            return state
        
        try:
            prompt_vars = {
                "destination": state["destination"],
                "total_days": state["total_days"],
                "travelers": state["travelers"],
                "start_date": state["start_date"],
                "end_date": state["end_date"],
                "accommodation_type": format_accommodation_type(state["accommodation_type"])
            }
            
            messages = PRICE_PREDICTION_PROMPT.format_messages(**prompt_vars)
            response = await self.llm.ainvoke(messages)
            
            cleaned_text = self._clean_json_response(response.content)
            price_data = json.loads(cleaned_text)
            
            state["price_prediction"] = price_data
            logger.info(f"Price prediction generated for {state['destination']}")
            
        except Exception as e:
            logger.warning(f"Price prediction failed: {str(e)}")
            # Continue without price prediction
        
        return state
    
    async def _get_weather_advice(self, state: ItineraryState) -> ItineraryState:
        """Get weather and seasonal advice"""
        if not self.llm:
            return state
        
        try:
            prompt_vars = {
                "destination": state["destination"],
                "start_date": state["start_date"],
                "end_date": state["end_date"],
                "total_days": state["total_days"]
            }
            
            messages = WEATHER_ADVICE_PROMPT.format_messages(**prompt_vars)
            response = await self.llm.ainvoke(messages)
            
            state["weather_advice"] = response.content
            logger.info(f"Weather advice generated for {state['destination']}")
            
        except Exception as e:
            logger.warning(f"Weather advice generation failed: {str(e)}")
        
        return state
    
    async def _compile_response(self, state: ItineraryState) -> ItineraryState:
        """Compile the final response"""
        try:
            if not state["itinerary_data"]:
                state["error"] = "No itinerary data to compile"
                return state
            
            # Create daily plans
            daily_plans = []
            start_date_obj = datetime.strptime(state["start_date"], '%Y-%m-%d').date()
            current_date = start_date_obj
            
            for day_num, day_data in enumerate(state["itinerary_data"].get('daily_plans', []), 1):
                daily_plan = DailyPlan(
                    day=day_num,
                    date=current_date.strftime("%Y-%m-%d"),
                    activities=day_data.get('activities', []),
                    meals=day_data.get('meals', []),
                    accommodation=day_data.get('accommodation'),
                    transport=day_data.get('transport', [])
                )
                daily_plans.append(daily_plan)
                current_date += timedelta(days=1)
            
            # Get budget estimate
            budget_estimate = state["itinerary_data"].get('budget_estimate', 0.0)
            if state["price_prediction"]:
                budget_estimate = state["price_prediction"].get('total_estimated_cost', budget_estimate)
            
            # Combine recommendations
            recommendations = state["itinerary_data"].get('recommendations', {})
            if state["weather_advice"]:
                if 'tips' not in recommendations:
                    recommendations['tips'] = []
                recommendations['tips'].append(f"Weather Info: {state['weather_advice']}")
            
            # Create final response
            response = ItineraryResponse(
                destination=state["destination"],
                total_days=state["total_days"],
                budget_estimate=budget_estimate,
                daily_plans=daily_plans,
                recommendations=recommendations
            )
            
            state["final_response"] = response
            logger.info(f"Final response compiled for {state['destination']}")
            return state
            
        except Exception as e:
            logger.error(f"Response compilation failed: {str(e)}")
            state["error"] = f"Failed to compile response: {str(e)}"
            return state
    
    async def _handle_error(self, state: ItineraryState) -> ItineraryState:
        """Handle workflow errors"""
        logger.error(f"Workflow error: {state.get('error', 'Unknown error')}")
        
        # Generate fallback response
        try:
            fallback = await self._generate_fallback_itinerary(
                state["destination"],
                state["start_date"],
                state["end_date"],
                state["budget"],
                state["interests"],
                state["travelers"],
                state["accommodation_type"]
            )
            state["final_response"] = fallback
            state["error"] = None  # Clear error since we have a fallback
        except Exception as e:
            logger.error(f"Fallback generation failed: {str(e)}")
            state["error"] = f"Complete failure: {str(e)}"
        
        return state
    
    def _should_continue_after_validation(self, state: ItineraryState) -> str:
        """Decide whether to continue after validation"""
        return "error" if state.get("error") else "continue"
    
    def _should_continue_after_generation(self, state: ItineraryState) -> str:
        """Decide whether to continue after itinerary generation"""
        if state.get("error"):
            return "error"
        elif state.get("itinerary_data"):
            return "continue"
        elif state["retry_count"] < 3:
            return "retry"
        else:
            return "error"
    
    def _clean_json_response(self, text: str) -> str:
        """Clean AI response to extract valid JSON"""
        cleaned_text = text.strip()
        
        # Remove markdown code blocks
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        if cleaned_text.startswith("```"):
            cleaned_text = cleaned_text[3:]
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]
        
        return cleaned_text.strip()
    
    def _validate_itinerary_structure(self, data: Dict[str, Any]) -> bool:
        """Validate the structure of generated itinerary data"""
        try:
            # Check required top-level keys
            if 'daily_plans' not in data:
                return False
            
            # Check daily plans structure
            daily_plans = data['daily_plans']
            if not isinstance(daily_plans, list) or len(daily_plans) == 0:
                return False
            
            # Validate at least one daily plan
            first_plan = daily_plans[0]
            required_keys = ['day', 'activities']
            for key in required_keys:
                if key not in first_plan:
                    return False
            
            return True
            
        except Exception:
            return False
    
    async def _generate_fallback_itinerary(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        budget: Optional[float] = None,
        interests: List[str] = None,
        travelers: int = 1,
        accommodation_type: Optional[str] = None
    ) -> ItineraryResponse:
        """Generate a basic fallback itinerary"""
        start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
        total_days = (end_date_obj - start_date_obj).days + 1
        current_date = start_date_obj
        
        daily_plans = []
        for day_num in range(1, total_days + 1):
            daily_plan = DailyPlan(
                day=day_num,
                date=current_date.strftime("%Y-%m-%d"),
                activities=[
                    {
                        "time": "09:00",
                        "title": f"Explore {destination}",
                        "description": f"Discover the beautiful city of {destination}",
                        "location": destination,
                        "duration": "4 hours",
                        "cost": 20,
                        "type": "sightseeing"
                    },
                    {
                        "time": "14:00",
                        "title": "Local Cuisine Experience",
                        "description": f"Try authentic local food in {destination}",
                        "location": destination,
                        "duration": "2 hours",
                        "cost": 15,
                        "type": "food"
                    }
                ],
                meals=[
                    {
                        "name": f"Local Restaurant in {destination}",
                        "cuisine": "Local",
                        "rating": 4.0,
                        "price_range": "$$",
                        "description": f"Enjoy authentic local cuisine in {destination}"
                    }
                ],
                accommodation={
                    "name": f"Hotel in {destination}",
                    "rating": 3.5,
                    "price": 80,
                    "amenities": ["WiFi", "Air Conditioning"],
                    "location": destination
                },
                transport=[
                    {
                        "type": "walking",
                        "description": "Explore the city on foot",
                        "duration": "30 minutes"
                    }
                ]
            )
            daily_plans.append(daily_plan)
            current_date += timedelta(days=1)
        
        return ItineraryResponse(
            destination=destination,
            total_days=total_days,
            budget_estimate=budget or 1000.0,
            daily_plans=daily_plans,
            recommendations={
                "hotels": [f"Look for well-reviewed hotels in {destination}"],
                "restaurants": [f"Try local restaurants in {destination}"],
                "tips": [
                    "This is a basic itinerary. AI service was temporarily unavailable.",
                    "Transportation: Use local public transport for cost-effective travel.",
                    "Safety: Always be aware of your surroundings and keep belongings secure.",
                    "Culture: Respect local customs and dress appropriately for religious sites.",
                    "Planning: Book popular attractions in advance to avoid disappointment."
                ]
            }
        )
