import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import date, datetime
from config import settings

logger = logging.getLogger(__name__)

class FlightService:
    def __init__(self):
        self.serp_api_key = settings.serp_api_key
        self.use_real_api = bool(self.serp_api_key and self.serp_api_key != "your_serp_api_key_here")
        
        if not self.use_real_api:
            logger.error("No valid SERP API key found. Please set SERP_API_KEY in your environment variables.")
            raise ValueError("SERP_API_KEY is required. Please set it in your environment variables.")
    
    async def search_flights(
        self,
        from_location: str,
        to_location: str,
        departure_date: date,
        return_date: Optional[date] = None,
        passengers: int = 1,
        class_type: str = "economy"
    ) -> List[Dict[str, Any]]:
        """
        Search for flights using Google SERP API
        """
        try:
                return await self._search_with_serp_api(
                    from_location, to_location, departure_date, return_date, passengers, class_type
                )
        except Exception as e:
            logger.error(f"Error searching flights: {str(e)}")
            return []
    
    async def _search_with_serp_api(
        self,
        from_location: str,
        to_location: str,
        departure_date: date,
        return_date: Optional[date] = None,
        passengers: int = 1,
        class_type: str = "economy"
    ) -> List[Dict[str, Any]]:
        """
        Search flights using Google SERP API
        """
        try:
            from serpapi import GoogleSearch
            
            # Prepare search parameters
            search_params = {
                "engine": "google_flights",
                "api_key": self.serp_api_key,
                "departure_id": from_location,
                "arrival_id": to_location,
                "outbound_date": departure_date.strftime("%Y-%m-%d"),
                "adults": passengers,
                "currency": "INR",
                "hl": "en"
            }
            
            # For round-trip flights, include return_date
            if return_date:
                search_params["return_date"] = return_date.strftime("%Y-%m-%d")
            
            # Add class type if specified
            if class_type != "economy":
                search_params["travel_class"] = class_type
            
            logger.info(f"Calling SerpApi with params: {search_params}")
            
            # Perform the search
            search = GoogleSearch(search_params)
            results = search.get_dict()
            
            logger.info(f"SERP API response keys: {list(results.keys())}")
            
            # Parse the results
            flights = []
            
            # Handle best_flights and other_flights from SERP API
            if "best_flights" in results:
                for flight_option in results["best_flights"][:5]:  # Limit to 5 best flights
                    parsed_flight = self._parse_serp_flight_option(flight_option, from_location, to_location)
                    if parsed_flight:
                        flights.append(parsed_flight)
            
            if "other_flights" in results:
                for flight_option in results["other_flights"][:10]:  # Limit to 10 other flights
                    parsed_flight = self._parse_serp_flight_option(flight_option, from_location, to_location)
                    if parsed_flight:
                        flights.append(parsed_flight)
            
            # If no structured flights found, try legacy format
            if not flights and "flights" in results and "options" in results["flights"]:
                for option in results["flights"]["options"][:10]:
                    flight = self._parse_serp_flight(option, from_location, to_location)
                    if flight:
                        flights.append(flight)
            
            logger.info(f"Found {len(flights)} flights using SERP API")
            return flights
            
        except Exception as e:
            logger.error(f"SERP API error: {str(e)}")
            raise e
    
    def _parse_serp_flight_option(self, flight_option: Dict[str, Any], from_location: str, to_location: str) -> Optional[Dict[str, Any]]:
        """
        Parse SERP API flight option (best_flights/other_flights format) into our standard format
        """
        try:
            flights = flight_option.get("flights", [])
            layovers = flight_option.get("layovers", [])
            total_duration = flight_option.get("total_duration", 0)
            price = flight_option.get("price", 0)
            carbon_emissions = flight_option.get("carbon_emissions", {})
            departure_token = flight_option.get("departure_token", "")
            booking_token = flight_option.get("booking_token", "")
            flight_type = flight_option.get("type", "One way")
            airline_logo = flight_option.get("airline_logo", "")
            extensions = flight_option.get("extensions", [])
            
            # Parse individual flight segments
            flight_segments = []
            for i, flight in enumerate(flights):
                departure_airport = flight.get("departure_airport", {})
                arrival_airport = flight.get("arrival_airport", {})
                
                # Parse departure time
                departure_time_str = departure_airport.get("time", "")
                departure_time = ""
                departure_date = ""
                if departure_time_str:
                    try:
                        # Handle format like "2023-10-03 15:10"
                        dt = datetime.strptime(departure_time_str, "%Y-%m-%d %H:%M")
                        departure_time = dt.strftime("%H:%M")
                        departure_date = dt.strftime("%Y-%m-%d")
                    except:
                        departure_time = departure_time_str
                
                # Parse arrival time
                arrival_time_str = arrival_airport.get("time", "")
                arrival_time = ""
                arrival_date = ""
                if arrival_time_str:
                    try:
                        dt = datetime.strptime(arrival_time_str, "%Y-%m-%d %H:%M")
                        arrival_time = dt.strftime("%H:%M")
                        arrival_date = dt.strftime("%Y-%m-%d")
                    except:
                        arrival_time = arrival_time_str
                
                # Calculate duration
                duration_minutes = flight.get("duration", 0)
                duration = f"{duration_minutes // 60}h {duration_minutes % 60}m" if duration_minutes > 0 else "N/A"
                
                # Extract amenities from extensions
                flight_extensions = flight.get("extensions", [])
                amenities = []
                for ext in flight_extensions:
                    if "Wi-Fi" in ext or "WiFi" in ext:
                        amenities.append("WiFi")
                    if "power" in ext.lower() or "usb" in ext.lower():
                        amenities.append("Power Outlets")
                    if "video" in ext.lower() or "entertainment" in ext.lower():
                        amenities.append("Entertainment")
                    if "meal" in ext.lower() or "food" in ext.lower():
                        amenities.append("Meal")
                    if "legroom" in ext.lower():
                        amenities.append("Premium Legroom")
                    if "suite" in ext.lower():
                        amenities.append("Individual Suite")
                    if "lie flat" in ext.lower():
                        amenities.append("Lie Flat Seat")
                
                # Default amenities if none found
                if not amenities:
                    amenities = ["WiFi", "Entertainment"]
                
                # Create flight segment
                flight_segment = {
                    "id": f"segment_{i}",
                    "airline": flight.get("airline", "Unknown"),
                    "airline_logo": flight.get("airline_logo", ""),
                    "flight_number": flight.get("flight_number", "N/A"),
                    "departure": {
                        "airport": departure_airport.get("id", from_location.upper()[:3]),
                        "airport_name": departure_airport.get("name", ""),
                        "time": departure_time,
                        "date": departure_date
                    },
                    "arrival": {
                        "airport": arrival_airport.get("id", to_location.upper()[:3]),
                        "airport_name": arrival_airport.get("name", ""),
                        "time": arrival_time,
                        "date": arrival_date
                    },
                    "duration": duration,
                    "duration_minutes": duration_minutes,
                    "amenities": amenities,
                    "aircraft": flight.get("airplane", "Unknown"),
                    "travel_class": flight.get("travel_class", "Economy"),
                    "legroom": flight.get("legroom", ""),
                    "overnight": flight.get("overnight", False),
                    "often_delayed": flight.get("often_delayed_by_over_30_min", False),
                    "ticket_also_sold_by": flight.get("ticket_also_sold_by", []),
                    "plane_and_crew_by": flight.get("plane_and_crew_by", "")
                }
                
                flight_segments.append(flight_segment)
            
            # Parse layovers
            layover_info = []
            for layover in layovers:
                layover_info.append({
                    "duration": layover.get("duration", 0),
                    "airport": layover.get("id", ""),
                    "airport_name": layover.get("name", ""),
                    "overnight": layover.get("overnight", False)
                })
            
            # Calculate total duration in hours and minutes
            total_hours = total_duration // 60
            total_minutes = total_duration % 60
            total_duration_str = f"{total_hours}h {total_minutes}m" if total_duration > 0 else "N/A"
            
            # Calculate stops
            stops = len(layovers) if layovers else 0
            
            # Create comprehensive flight object
            parsed_flight = {
                "id": f"serp_{hash(str(flight_option))}",
                "price": price,
                "currency": "INR",
                "stops": stops,
                "total_duration": total_duration_str,
                "total_duration_minutes": total_duration,
                "flight_type": flight_type,
                "airline_logo": airline_logo,
                "departure_token": departure_token,
                "booking_token": booking_token,
                "carbon_emissions": {
                    "this_flight": carbon_emissions.get("this_flight", 0),
                    "typical_for_route": carbon_emissions.get("typical_for_this_route", 0),
                    "difference_percent": carbon_emissions.get("difference_percent", 0)
                },
                "extensions": extensions,
                "flight_segments": flight_segments,
                "layovers": layover_info,
                "rating": 4.0,  # Default rating
                "amenities": list(set([amenity for segment in flight_segments for amenity in segment.get("amenities", [])]))
            }
            
            return parsed_flight
            
        except Exception as e:
            logger.error(f"Error parsing SERP flight option: {str(e)}")
            return None

    def _parse_serp_flight(self, option: Dict[str, Any], from_location: str, to_location: str) -> Optional[Dict[str, Any]]:
        """
        Parse legacy SERP API flight result into our standard format
        """
        try:
            # Extract flight details from SERP response
            flight_info = option.get("flight_info", {})
            price_info = option.get("price_info", {})
            
            # Parse departure and arrival times
            departure_time = flight_info.get("departure_time", "")
            arrival_time = flight_info.get("arrival_time", "")
            duration = flight_info.get("duration", "")
            
            # Extract price
            price = price_info.get("price", 0)
            if isinstance(price, str):
                # Remove currency symbols and convert to float
                price = float(price.replace("$", "").replace(",", ""))
            
            # Create flight object
            flight = {
                "id": f"serp_{hash(str(option))}",
                "airline": flight_info.get("airline", "Unknown"),
                "flight_number": flight_info.get("flight_number", "N/A"),
                "departure": {
                    "airport": from_location.upper()[:3],
                    "time": departure_time,
                    "date": flight_info.get("departure_date", "")
                },
                "arrival": {
                    "airport": to_location.upper()[:3],
                    "time": arrival_time,
                    "date": flight_info.get("arrival_date", "")
                },
                "duration": duration,
                "price": price,
                "stops": flight_info.get("stops", 0),
                "rating": 4.0,  # Default rating
                "amenities": ["WiFi", "Entertainment"]  # Default amenities
            }
            
            return flight
            
        except Exception as e:
            logger.error(f"Error parsing SERP flight: {str(e)}")
            return None
    

    
    async def get_popular_flights(self) -> List[Dict[str, Any]]:
        """
        Get popular flight routes using real SerpApi data
        """
        try:
            # Use a future date for popular flights search
            from datetime import timedelta
            future_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
            
        popular_routes = [
            ("JFK", "LHR", "New York to London"),
            ("LAX", "NRT", "Los Angeles to Tokyo"),
            ("CDG", "DXB", "Paris to Dubai"),
            ("SIN", "SYD", "Singapore to Sydney"),
            ("FRA", "JFK", "Frankfurt to New York")
        ]
        
        popular_flights = []
            for from_airport, to_airport, route_name in popular_routes:
                try:
                    # Search for real flights for each popular route
                    flights = await self._search_with_serp_api(
                        from_airport, to_airport, 
                        datetime.strptime(future_date, "%Y-%m-%d").date(),
                        passengers=1, class_type="economy"
                    )
                    
                    if flights:
                        # Take the first flight and add route name
                        flight = flights[0]
                        flight["route_name"] = route_name
            popular_flights.append(flight)
                        
                        # Limit to 5 popular flights
                        if len(popular_flights) >= 5:
                            break
                            
                except Exception as e:
                    logger.warning(f"Failed to get real data for {route_name}: {str(e)}")
                    continue
        
        return popular_flights
            
        except Exception as e:
            logger.error(f"Error getting popular flights: {str(e)}")
            return []
    
    async def get_flight_details(self, flight_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific flight using SerpApi
        """
        try:
            # Extract booking token from flight_id if it contains one
            if "booking_token" in flight_id:
                # This would require a separate API call to get flight details
                # For now, return a message indicating this feature needs implementation
        return {
            "id": flight_id,
                    "message": "Flight details retrieval requires booking token. Use booking options endpoint instead.",
                    "suggestion": "Use /api/v1/flights/booking-options/{booking_token} for detailed flight information"
                }
            else:
                # Try to search for flights with this ID pattern
                # This is a simplified approach - in production you'd want a more robust system
                return {
                    "id": flight_id,
                    "message": "Flight details not available. Please use flight search to get current flight information.",
                    "suggestion": "Use /api/v1/flights/search to find current flights"
                }
        except Exception as e:
            logger.error(f"Error getting flight details: {str(e)}")
            return None 

    async def get_airport_suggestions(self, query: str) -> List[Dict[str, Any]]:
        """
        Get airport suggestions for autocomplete using comprehensive airport database
        """
        # Comprehensive airports database (keeping this as SerpApi doesn't have airport search)
        airports = [
            {"code": "JFK", "name": "John F. Kennedy International Airport", "city": "New York", "country": "USA"},
            {"code": "LAX", "name": "Los Angeles International Airport", "city": "Los Angeles", "country": "USA"},
            {"code": "ORD", "name": "O'Hare International Airport", "city": "Chicago", "country": "USA"},
            {"code": "DFW", "name": "Dallas/Fort Worth International Airport", "city": "Dallas", "country": "USA"},
            {"code": "ATL", "name": "Hartsfield-Jackson Atlanta International Airport", "city": "Atlanta", "country": "USA"},
            {"code": "LHR", "name": "London Heathrow Airport", "city": "London", "country": "UK"},
            {"code": "CDG", "name": "Charles de Gaulle Airport", "city": "Paris", "country": "France"},
            {"code": "FRA", "name": "Frankfurt Airport", "city": "Frankfurt", "country": "Germany"},
            {"code": "AMS", "name": "Amsterdam Airport Schiphol", "city": "Amsterdam", "country": "Netherlands"},
            {"code": "DXB", "name": "Dubai International Airport", "city": "Dubai", "country": "UAE"},
            {"code": "NRT", "name": "Narita International Airport", "city": "Tokyo", "country": "Japan"},
            {"code": "HND", "name": "Haneda Airport", "city": "Tokyo", "country": "Japan"},
            {"code": "SIN", "name": "Singapore Changi Airport", "city": "Singapore", "country": "Singapore"},
            {"code": "SYD", "name": "Sydney Airport", "city": "Sydney", "country": "Australia"},
            {"code": "MEL", "name": "Melbourne Airport", "city": "Melbourne", "country": "Australia"},
            {"code": "YYZ", "name": "Toronto Pearson International Airport", "city": "Toronto", "country": "Canada"},
            {"code": "YVR", "name": "Vancouver International Airport", "city": "Vancouver", "country": "Canada"},
            {"code": "GRU", "name": "São Paulo/Guarulhos International Airport", "city": "São Paulo", "country": "Brazil"},
            {"code": "MEX", "name": "Mexico City International Airport", "city": "Mexico City", "country": "Mexico"},
            {"code": "BOM", "name": "Chhatrapati Shivaji Maharaj International Airport", "city": "Mumbai", "country": "India"},
            {"code": "DEL", "name": "Indira Gandhi International Airport", "city": "Delhi", "country": "India"},
            {"code": "PEK", "name": "Beijing Capital International Airport", "city": "Beijing", "country": "China"},
            {"code": "PVG", "name": "Shanghai Pudong International Airport", "city": "Shanghai", "country": "China"},
            {"code": "HKG", "name": "Hong Kong International Airport", "city": "Hong Kong", "country": "China"},
            {"code": "ICN", "name": "Incheon International Airport", "city": "Seoul", "country": "South Korea"},
            {"code": "BKK", "name": "Suvarnabhumi Airport", "city": "Bangkok", "country": "Thailand"},
            {"code": "KUL", "name": "Kuala Lumpur International Airport", "city": "Kuala Lumpur", "country": "Malaysia"},
            {"code": "MNL", "name": "Ninoy Aquino International Airport", "city": "Manila", "country": "Philippines"},
            {"code": "CGK", "name": "Soekarno-Hatta International Airport", "city": "Jakarta", "country": "Indonesia"},
            {"code": "IST", "name": "Istanbul Airport", "city": "Istanbul", "country": "Turkey"},
            {"code": "CAI", "name": "Cairo International Airport", "city": "Cairo", "country": "Egypt"},
            {"code": "JNB", "name": "O.R. Tambo International Airport", "city": "Johannesburg", "country": "South Africa"},
            {"code": "NBO", "name": "Jomo Kenyatta International Airport", "city": "Nairobi", "country": "Kenya"},
            {"code": "LAG", "name": "Murtala Muhammed International Airport", "city": "Lagos", "country": "Nigeria"},
            {"code": "RUH", "name": "King Khalid International Airport", "city": "Riyadh", "country": "Saudi Arabia"},
            {"code": "DOH", "name": "Hamad International Airport", "city": "Doha", "country": "Qatar"},
            {"code": "AUH", "name": "Abu Dhabi International Airport", "city": "Abu Dhabi", "country": "UAE"},
            {"code": "MAD", "name": "Adolfo Suárez Madrid–Barajas Airport", "city": "Madrid", "country": "Spain"},
            {"code": "BCN", "name": "Barcelona–El Prat Airport", "city": "Barcelona", "country": "Spain"},
            {"code": "FCO", "name": "Leonardo da Vinci International Airport", "city": "Rome", "country": "Italy"},
            {"code": "MXP", "name": "Milan Malpensa Airport", "city": "Milan", "country": "Italy"},
            {"code": "ZRH", "name": "Zurich Airport", "city": "Zurich", "country": "Switzerland"},
            {"code": "VIE", "name": "Vienna International Airport", "city": "Vienna", "country": "Austria"},
            {"code": "ARN", "name": "Stockholm Arlanda Airport", "city": "Stockholm", "country": "Sweden"},
            {"code": "CPH", "name": "Copenhagen Airport", "city": "Copenhagen", "country": "Denmark"},
            {"code": "OSL", "name": "Oslo Airport", "city": "Oslo", "country": "Norway"},
            {"code": "HEL", "name": "Helsinki Airport", "city": "Helsinki", "country": "Finland"},
            {"code": "WAW", "name": "Warsaw Chopin Airport", "city": "Warsaw", "country": "Poland"},
            {"code": "PRG", "name": "Václav Havel Airport Prague", "city": "Prague", "country": "Czech Republic"},
            {"code": "BUD", "name": "Budapest Ferenc Liszt International Airport", "city": "Budapest", "country": "Hungary"},
            {"code": "ATH", "name": "Athens International Airport", "city": "Athens", "country": "Greece"},
            {"code": "LIS", "name": "Lisbon Airport", "city": "Lisbon", "country": "Portugal"},
            {"code": "OPO", "name": "Porto Airport", "city": "Porto", "country": "Portugal"},
            {"code": "DUB", "name": "Dublin Airport", "city": "Dublin", "country": "Ireland"},
            {"code": "EDI", "name": "Edinburgh Airport", "city": "Edinburgh", "country": "UK"},
            {"code": "MAN", "name": "Manchester Airport", "city": "Manchester", "country": "UK"},
            {"code": "BHX", "name": "Birmingham Airport", "city": "Birmingham", "country": "UK"},
            {"code": "GLA", "name": "Glasgow Airport", "city": "Glasgow", "country": "UK"},
            {"code": "BRS", "name": "Bristol Airport", "city": "Bristol", "country": "UK"},
            {"code": "NCL", "name": "Newcastle Airport", "city": "Newcastle", "country": "UK"},
            {"code": "LPL", "name": "Liverpool John Lennon Airport", "city": "Liverpool", "country": "UK"},
            {"code": "EMA", "name": "East Midlands Airport", "city": "Nottingham", "country": "UK"},
            {"code": "LTN", "name": "London Luton Airport", "city": "London", "country": "UK"},
            {"code": "STN", "name": "London Stansted Airport", "city": "London", "country": "UK"},
            {"code": "LCY", "name": "London City Airport", "city": "London", "country": "UK"},
            {"code": "LGW", "name": "London Gatwick Airport", "city": "London", "country": "UK"},
            {"code": "SFO", "name": "San Francisco International Airport", "city": "San Francisco", "country": "USA"},
            {"code": "SEA", "name": "Seattle-Tacoma International Airport", "city": "Seattle", "country": "USA"},
            {"code": "DEN", "name": "Denver International Airport", "city": "Denver", "country": "USA"},
            {"code": "LAS", "name": "McCarran International Airport", "city": "Las Vegas", "country": "USA"},
            {"code": "MIA", "name": "Miami International Airport", "city": "Miami", "country": "USA"},
            {"code": "MCO", "name": "Orlando International Airport", "city": "Orlando", "country": "USA"},
            {"code": "BOS", "name": "Boston Logan International Airport", "city": "Boston", "country": "USA"},
            {"code": "PHL", "name": "Philadelphia International Airport", "city": "Philadelphia", "country": "USA"},
            {"code": "DTW", "name": "Detroit Metropolitan Airport", "city": "Detroit", "country": "USA"},
            {"code": "MSP", "name": "Minneapolis-Saint Paul International Airport", "city": "Minneapolis", "country": "USA"},
            {"code": "CLT", "name": "Charlotte Douglas International Airport", "city": "Charlotte", "country": "USA"},
            {"code": "IAH", "name": "George Bush Intercontinental Airport", "city": "Houston", "country": "USA"},
            {"code": "PHX", "name": "Phoenix Sky Harbor International Airport", "city": "Phoenix", "country": "USA"},
            {"code": "AUS", "name": "Austin-Bergstrom International Airport", "city": "Austin", "country": "USA"},
            {"code": "BNA", "name": "Nashville International Airport", "city": "Nashville", "country": "USA"},
            {"code": "RDU", "name": "Raleigh-Durham International Airport", "city": "Raleigh", "country": "USA"},
            {"code": "CLE", "name": "Cleveland Hopkins International Airport", "city": "Cleveland", "country": "USA"},
            {"code": "PIT", "name": "Pittsburgh International Airport", "city": "Pittsburgh", "country": "USA"},
            {"code": "CVG", "name": "Cincinnati/Northern Kentucky International Airport", "city": "Cincinnati", "country": "USA"},
            {"code": "IND", "name": "Indianapolis International Airport", "city": "Indianapolis", "country": "USA"},
            {"code": "MCI", "name": "Kansas City International Airport", "city": "Kansas City", "country": "USA"},
            {"code": "STL", "name": "St. Louis Lambert International Airport", "city": "St. Louis", "country": "USA"},
            {"code": "MKE", "name": "Milwaukee Mitchell International Airport", "city": "Milwaukee", "country": "USA"},
            {"code": "PDX", "name": "Portland International Airport", "city": "Portland", "country": "USA"},
            {"code": "SLC", "name": "Salt Lake City International Airport", "city": "Salt Lake City", "country": "USA"},
            {"code": "ABQ", "name": "Albuquerque International Sunport", "city": "Albuquerque", "country": "USA"},
            {"code": "TUS", "name": "Tucson International Airport", "city": "Tucson", "country": "USA"},
            {"code": "ELP", "name": "El Paso International Airport", "city": "El Paso", "country": "USA"},
            {"code": "SAT", "name": "San Antonio International Airport", "city": "San Antonio", "country": "USA"},
            {"code": "OKC", "name": "Will Rogers World Airport", "city": "Oklahoma City", "country": "USA"},
            {"code": "TUL", "name": "Tulsa International Airport", "city": "Tulsa", "country": "USA"},
            {"code": "OMA", "name": "Eppley Airfield", "city": "Omaha", "country": "USA"},
            {"code": "DSM", "name": "Des Moines International Airport", "city": "Des Moines", "country": "USA"},
            {"code": "MSY", "name": "Louis Armstrong New Orleans International Airport", "city": "New Orleans", "country": "USA"},
            {"code": "JAX", "name": "Jacksonville International Airport", "city": "Jacksonville", "country": "USA"},
            {"code": "RSW", "name": "Southwest Florida International Airport", "city": "Fort Myers", "country": "USA"},
            {"code": "TPA", "name": "Tampa International Airport", "city": "Tampa", "country": "USA"},
            {"code": "FLL", "name": "Fort Lauderdale-Hollywood International Airport", "city": "Fort Lauderdale", "country": "USA"},
            {"code": "PBI", "name": "Palm Beach International Airport", "city": "West Palm Beach", "country": "USA"},
            {"code": "CHS", "name": "Charleston International Airport", "city": "Charleston", "country": "USA"},
            {"code": "SAV", "name": "Savannah/Hilton Head International Airport", "city": "Savannah", "country": "USA"},
            {"code": "GSP", "name": "Greenville-Spartanburg International Airport", "city": "Greenville", "country": "USA"},
            {"code": "AVL", "name": "Asheville Regional Airport", "city": "Asheville", "country": "USA"},
            {"code": "TYS", "name": "McGhee Tyson Airport", "city": "Knoxville", "country": "USA"},
            {"code": "CHA", "name": "Chattanooga Metropolitan Airport", "city": "Chattanooga", "country": "USA"},
            {"code": "BHM", "name": "Birmingham-Shuttlesworth International Airport", "city": "Birmingham", "country": "USA"},
            {"code": "MOB", "name": "Mobile Regional Airport", "city": "Mobile", "country": "USA"},
            {"code": "GPT", "name": "Gulfport-Biloxi International Airport", "city": "Gulfport", "country": "USA"},
            {"code": "JAN", "name": "Jackson-Medgar Wiley Evers International Airport", "city": "Jackson", "country": "USA"},
            {"code": "LIT", "name": "Bill and Hillary Clinton National Airport", "city": "Little Rock", "country": "USA"},
            {"code": "MEM", "name": "Memphis International Airport", "city": "Memphis", "country": "USA"},
            {"code": "BTR", "name": "Baton Rouge Metropolitan Airport", "city": "Baton Rouge", "country": "USA"},
            {"code": "SHV", "name": "Shreveport Regional Airport", "city": "Shreveport", "country": "USA"},
            {"code": "LFT", "name": "Lafayette Regional Airport", "city": "Lafayette", "country": "USA"},
            {"code": "BPT", "name": "Jack Brooks Regional Airport", "city": "Beaumont", "country": "USA"},
            {"code": "HOU", "name": "William P. Hobby Airport", "city": "Houston", "country": "USA"},
            {"code": "LBB", "name": "Lubbock Preston Smith International Airport", "city": "Lubbock", "country": "USA"},
            {"code": "AMA", "name": "Rick Husband Amarillo International Airport", "city": "Amarillo", "country": "USA"},
            {"code": "LCH", "name": "Lake Charles Regional Airport", "city": "Lake Charles", "country": "USA"},
            {"code": "BRO", "name": "Brownsville/South Padre Island International Airport", "city": "Brownsville", "country": "USA"},
            {"code": "CRP", "name": "Corpus Christi International Airport", "city": "Corpus Christi", "country": "USA"},
            {"code": "MAF", "name": "Midland International Air and Space Port", "city": "Midland", "country": "USA"},
            {"code": "SJT", "name": "San Angelo Regional Airport", "city": "San Angelo", "country": "USA"},
            {"code": "ACT", "name": "Waco Regional Airport", "city": "Waco", "country": "USA"},
            {"code": "TYR", "name": "Tyler Pounds Regional Airport", "city": "Tyler", "country": "USA"},
            {"code": "LFK", "name": "Angelina County Airport", "city": "Lufkin", "country": "USA"},
            {"code": "GGG", "name": "East Texas Regional Airport", "city": "Longview", "country": "USA"},
            {"code": "TXK", "name": "Texarkana Regional Airport", "city": "Texarkana", "country": "USA"},
            {"code": "FSM", "name": "Fort Smith Regional Airport", "city": "Fort Smith", "country": "USA"},
            {"code": "XNA", "name": "Northwest Arkansas National Airport", "city": "Fayetteville", "country": "USA"},
            {"code": "FSD", "name": "Sioux Falls Regional Airport", "city": "Sioux Falls", "country": "USA"},
            {"code": "RAP", "name": "Rapid City Regional Airport", "city": "Rapid City", "country": "USA"},
            {"code": "BIS", "name": "Bismarck Airport", "city": "Bismarck", "country": "USA"},
            {"code": "FAR", "name": "Hector International Airport", "city": "Fargo", "country": "USA"},
            {"code": "GFK", "name": "Grand Forks International Airport", "city": "Grand Forks", "country": "USA"},
            {"code": "DLH", "name": "Duluth International Airport", "city": "Duluth", "country": "USA"},
            {"code": "RST", "name": "Rochester International Airport", "city": "Rochester", "country": "USA"},
            {"code": "BJI", "name": "Bemidji Regional Airport", "city": "Bemidji", "country": "USA"},
            {"code": "BRD", "name": "Brainerd Lakes Regional Airport", "city": "Brainerd", "country": "USA"},
            {"code": "HIB", "name": "Range Regional Airport", "city": "Hibbing", "country": "USA"},
            {"code": "INL", "name": "Falls International Airport", "city": "International Falls", "country": "USA"},
            {"code": "BET", "name": "Bethel Airport", "city": "Bethel", "country": "USA"},
            {"code": "ANC", "name": "Ted Stevens Anchorage International Airport", "city": "Anchorage", "country": "USA"},
            {"code": "FAI", "name": "Fairbanks International Airport", "city": "Fairbanks", "country": "USA"},
            {"code": "JNU", "name": "Juneau International Airport", "city": "Juneau", "country": "USA"},
            {"code": "KET", "name": "Ketchikan International Airport", "city": "Ketchikan", "country": "USA"},
            {"code": "SIT", "name": "Sitka Rocky Gutierrez Airport", "city": "Sitka", "country": "USA"},
            {"code": "KTN", "name": "Ketchikan International Airport", "city": "Ketchikan", "country": "USA"},
            {"code": "WRG", "name": "Wrangell Airport", "city": "Wrangell", "country": "USA"},
            {"code": "PSG", "name": "Petersburg James A. Johnson Airport", "city": "Petersburg", "country": "USA"},
            {"code": "GST", "name": "Gustavus Airport", "city": "Gustavus", "country": "USA"},
            {"code": "HOM", "name": "Homer Airport", "city": "Homer", "country": "USA"},
            {"code": "KOD", "name": "Kodiak Airport", "city": "Kodiak", "country": "USA"},
            {"code": "ADQ", "name": "Kodiak Airport", "city": "Kodiak", "country": "USA"},
            {"code": "DUT", "name": "Unalaska Airport", "city": "Unalaska", "country": "USA"},
            {"code": "OME", "name": "Nome Airport", "city": "Nome", "country": "USA"},
            {"code": "OTZ", "name": "Ralph Wien Memorial Airport", "city": "Kotzebue", "country": "USA"},
            {"code": "BRW", "name": "Wiley Post-Will Rogers Memorial Airport", "city": "Barrow", "country": "USA"},
            {"code": "PSC", "name": "Tri-Cities Airport", "city": "Pasco", "country": "USA"},
            {"code": "GEG", "name": "Spokane International Airport", "city": "Spokane", "country": "USA"},
            {"code": "BOI", "name": "Boise Airport", "city": "Boise", "country": "USA"},
            {"code": "IDA", "name": "Idaho Falls Regional Airport", "city": "Idaho Falls", "country": "USA"},
            {"code": "PIH", "name": "Pocatello Regional Airport", "city": "Pocatello", "country": "USA"},
            {"code": "TWF", "name": "Magic Valley Regional Airport", "city": "Twin Falls", "country": "USA"},
            {"code": "SUN", "name": "Friedman Memorial Airport", "city": "Hailey", "country": "USA"},
            {"code": "LWS", "name": "Lewiston-Nez Perce County Airport", "city": "Lewiston", "country": "USA"},
            {"code": "PUW", "name": "Pullman-Moscow Regional Airport", "city": "Pullman", "country": "USA"},
            {"code": "ALW", "name": "Walla Walla Regional Airport", "city": "Walla Walla", "country": "USA"},
            {"code": "EUG", "name": "Eugene Airport", "city": "Eugene", "country": "USA"},
            {"code": "RDM", "name": "Redmond Municipal Airport", "city": "Redmond", "country": "USA"},
            {"code": "MFR", "name": "Rogue Valley International Airport", "city": "Medford", "country": "USA"},
            {"code": "OTH", "name": "Southwest Oregon Regional Airport", "city": "North Bend", "country": "USA"},
            {"code": "ACV", "name": "Arcata-Eureka Airport", "city": "Arcata", "country": "USA"},
            {"code": "CEC", "name": "Del Norte County Airport", "city": "Crescent City", "country": "USA"},
            {"code": "RDD", "name": "Redding Municipal Airport", "city": "Redding", "country": "USA"},
            {"code": "SAC", "name": "Sacramento International Airport", "city": "Sacramento", "country": "USA"},
            {"code": "SMF", "name": "Sacramento International Airport", "city": "Sacramento", "country": "USA"},
            {"code": "OAK", "name": "Oakland International Airport", "city": "Oakland", "country": "USA"},
            {"code": "SJC", "name": "San Jose International Airport", "city": "San Jose", "country": "USA"},
            {"code": "SNA", "name": "John Wayne Airport", "city": "Santa Ana", "country": "USA"},
            {"code": "ONT", "name": "Ontario International Airport", "city": "Ontario", "country": "USA"},
            {"code": "BUR", "name": "Bob Hope Airport", "city": "Burbank", "country": "USA"},
            {"code": "LGB", "name": "Long Beach Airport", "city": "Long Beach", "country": "USA"},
            {"code": "PSP", "name": "Palm Springs International Airport", "city": "Palm Springs", "country": "USA"},
            {"code": "SAN", "name": "San Diego International Airport", "city": "San Diego", "country": "USA"},
            {"code": "TIJ", "name": "Tijuana International Airport", "city": "Tijuana", "country": "Mexico"},
            {"code": "CUN", "name": "Cancún International Airport", "city": "Cancún", "country": "Mexico"},
            {"code": "GDL", "name": "Guadalajara International Airport", "city": "Guadalajara", "country": "Mexico"},
            {"code": "MTY", "name": "Monterrey International Airport", "city": "Monterrey", "country": "Mexico"},
            {"code": "PVR", "name": "Puerto Vallarta International Airport", "city": "Puerto Vallarta", "country": "Mexico"},
            {"code": "ZIH", "name": "Ixtapa-Zihuatanejo International Airport", "city": "Ixtapa", "country": "Mexico"},
            {"code": "ACA", "name": "Acapulco International Airport", "city": "Acapulco", "country": "Mexico"},
            {"code": "OAX", "name": "Oaxaca International Airport", "city": "Oaxaca", "country": "Mexico"},
            {"code": "VER", "name": "Veracruz International Airport", "city": "Veracruz", "country": "Mexico"},
            {"code": "VSA", "name": "Villahermosa International Airport", "city": "Villahermosa", "country": "Mexico"},
            {"code": "TGZ", "name": "Tuxtla Gutiérrez International Airport", "city": "Tuxtla Gutiérrez", "country": "Mexico"},
            {"code": "TAP", "name": "Tapachula International Airport", "city": "Tapachula", "country": "Mexico"},
            {"code": "CZM", "name": "Cozumel International Airport", "city": "Cozumel", "country": "Mexico"},
            {"code": "MID", "name": "Mérida International Airport", "city": "Mérida", "country": "Mexico"},
            {"code": "CUU", "name": "Chihuahua International Airport", "city": "Chihuahua", "country": "Mexico"},
            {"code": "HMO", "name": "Hermosillo International Airport", "city": "Hermosillo", "country": "Mexico"},
            {"code": "CUL", "name": "Culiacán International Airport", "city": "Culiacán", "country": "Mexico"},
            {"code": "MZT", "name": "Mazatlán International Airport", "city": "Mazatlán", "country": "Mexico"},
            {"code": "LAP", "name": "La Paz International Airport", "city": "La Paz", "country": "Mexico"},
            {"code": "SJD", "name": "Los Cabos International Airport", "city": "San José del Cabo", "country": "Mexico"},
            {"code": "LTO", "name": "Loreto International Airport", "city": "Loreto", "country": "Mexico"},
            {"code": "TLC", "name": "Toluca International Airport", "city": "Toluca", "country": "Mexico"},
            {"code": "QRO", "name": "Querétaro International Airport", "city": "Querétaro", "country": "Mexico"},
            {"code": "BJX", "name": "Del Bajío International Airport", "city": "León", "country": "Mexico"},
            {"code": "AGU", "name": "Aguascalientes International Airport", "city": "Aguascalientes", "country": "Mexico"},
            {"code": "ZCL", "name": "Zacatecas International Airport", "city": "Zacatecas", "country": "Mexico"},
            {"code": "SLP", "name": "San Luis Potosí International Airport", "city": "San Luis Potosí", "country": "Mexico"},
            {"code": "TAM", "name": "Tampico International Airport", "city": "Tampico", "country": "Mexico"},
            {"code": "REX", "name": "Reynosa International Airport", "city": "Reynosa", "country": "Mexico"},
            {"code": "MTT", "name": "Minatitlán/Coatzacoalcos International Airport", "city": "Minatitlán", "country": "Mexico"},
            {"code": "HUX", "name": "Bahías de Huatulco International Airport", "city": "Huatulco", "country": "Mexico"},
            {"code": "ZAP", "name": "Zapopan International Airport", "city": "Zapopan", "country": "Mexico"},
            {"code": "UPN", "name": "Uruapan International Airport", "city": "Uruapan", "country": "Mexico"},
            {"code": "MLM", "name": "Morelia International Airport", "city": "Morelia", "country": "Mexico"},
            {"code": "TXN", "name": "Tuxpan International Airport", "city": "Tuxpan", "country": "Mexico"},
            {"code": "PBC", "name": "Puebla International Airport", "city": "Puebla", "country": "Mexico"},
            {"code": "HUX", "name": "Bahías de Huatulco International Airport", "city": "Huatulco", "country": "Mexico"},
            {"code": "ZAP", "name": "Zapopan International Airport", "city": "Zapopan", "country": "Mexico"},
            {"code": "UPN", "name": "Uruapan International Airport", "city": "Uruapan", "country": "Mexico"},
            {"code": "MLM", "name": "Morelia International Airport", "city": "Morelia", "country": "Mexico"},
            {"code": "TXN", "name": "Tuxpan International Airport", "city": "Tuxpan", "country": "Mexico"},
            {"code": "PBC", "name": "Puebla International Airport", "city": "Puebla", "country": "Mexico"},
        ]
        
        # Filter airports based on query
        query_lower = query.lower()
        suggestions = []
        
        for airport in airports:
            if (query_lower in airport["code"].lower() or 
                query_lower in airport["name"].lower() or 
                query_lower in airport["city"].lower()):
                suggestions.append(airport)
        
        # Sort by relevance (exact matches first, then partial matches)
        suggestions.sort(key=lambda x: (
            query_lower not in x["code"].lower(),
            query_lower not in x["name"].lower(),
            x["city"]
        ))
        
        return suggestions[:10]  # Return top 10 suggestions 

    async def get_booking_options(self, booking_token: str) -> Dict[str, Any]:
        """
        Get booking options for a specific flight using booking token
        """
        try:
            logger.info(f"Getting booking options for token: {booking_token}")
            return await self._get_booking_options_with_serp_api(booking_token)
        except Exception as e:
            logger.error(f"Error getting booking options: {str(e)}")
            raise e

    async def _get_booking_options_with_serp_api(self, booking_token: str) -> Dict[str, Any]:
        """
        Get booking options using SerpApi Google Flights Booking Options API
        """
        try:
            from serpapi import GoogleSearch
            
            # Prepare search parameters for booking options
            search_params = {
                "engine": "google_flights",
                "api_key": self.serp_api_key,
                "booking_token": booking_token,
                "currency": "INR",
                "hl": "en"
            }
            
            logger.info(f"Calling SerpApi with params: {search_params}")
            
            # Perform the search
            search = GoogleSearch(search_params)
            results = search.get_dict()
            
            logger.info(f"SERP API response keys: {list(results.keys())}")
            
            # Parse and structure the booking options response
            booking_data = {
                "selected_flights": self._parse_selected_flights(results.get("selected_flights", [])),
                "baggage_prices": results.get("baggage_prices", {}),
                "booking_options": self._parse_booking_options(results.get("booking_options", [])),
                "price_insights": results.get("price_insights", {})
            }
            
            logger.info(f"Parsed booking options count: {len(booking_data['booking_options'])}")
            return booking_data
            
        except Exception as e:
            logger.error(f"Error getting booking options from SerpApi: {str(e)}")
            raise e

    def _parse_selected_flights(self, selected_flights: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Parse selected flights from SerpApi response
        """
        parsed_flights = []
        
        for flight_data in selected_flights:
            try:
                flights = flight_data.get("flights", [])
                if not flights:
                    continue
                
                # Parse the first flight segment
                flight = flights[0]
                departure_airport = flight.get("departure_airport", {})
                arrival_airport = flight.get("arrival_airport", {})
                
                # Parse departure time
                departure_time_str = departure_airport.get("time", "")
                departure_time = ""
                departure_date = ""
                if departure_time_str:
                    try:
                        dt = datetime.strptime(departure_time_str, "%Y-%m-%d %H:%M")
                        departure_time = dt.strftime("%H:%M")
                        departure_date = dt.strftime("%Y-%m-%d")
                    except:
                        departure_time = departure_time_str
                
                # Parse arrival time
                arrival_time_str = arrival_airport.get("time", "")
                arrival_time = ""
                arrival_date = ""
                if arrival_time_str:
                    try:
                        dt = datetime.strptime(arrival_time_str, "%Y-%m-%d %H:%M")
                        arrival_time = dt.strftime("%H:%M")
                        arrival_date = dt.strftime("%Y-%m-%d")
                    except:
                        arrival_time = arrival_time_str
                
                # Calculate duration
                duration_minutes = flight.get("duration", 0)
                duration = f"{duration_minutes // 60}h {duration_minutes % 60}m" if duration_minutes > 0 else "N/A"
                
                # Create flight segments
                flight_segments = [{
                            "id": "segment_1",
                    "airline": flight.get("airline", "Unknown"),
                    "airline_logo": flight.get("airline_logo", ""),
                    "flight_number": flight.get("flight_number", "N/A"),
                            "departure": {
                        "airport": departure_airport.get("id", ""),
                        "airport_name": departure_airport.get("name", ""),
                        "time": departure_time,
                        "date": departure_date
                            },
                            "arrival": {
                        "airport": arrival_airport.get("id", ""),
                        "airport_name": arrival_airport.get("name", ""),
                        "time": arrival_time,
                        "date": arrival_date
                    },
                    "duration": duration,
                    "duration_minutes": duration_minutes,
                    "amenities": self._extract_amenities_from_extensions(flight.get("extensions", [])),
                    "aircraft": flight.get("airplane", "Unknown"),
                    "travel_class": flight.get("travel_class", "Economy"),
                    "legroom": flight.get("legroom", ""),
                            "overnight": False,
                            "often_delayed": False,
                            "ticket_also_sold_by": [],
                            "plane_and_crew_by": ""
                }]
                
                # Create parsed flight object
                parsed_flight = {
                    "id": f"selected_{hash(str(flight_data))}",
                    "price": 0,  # Price will come from booking options
                    "currency": "INR",
                    "stops": 0,
                    "total_duration": duration,
                    "total_duration_minutes": duration_minutes,
                    "flight_type": flight_data.get("type", "One way"),
                    "airline_logo": flight_data.get("airline_logo", ""),
                    "departure_token": flight_data.get("departure_token", ""),
                    "booking_token": "",  # This is the input token
                    "carbon_emissions": flight_data.get("carbon_emissions", {
                        "this_flight": 0,
                        "typical_for_route": 0,
                        "difference_percent": 0
                    }),
                    "extensions": flight.get("extensions", []),
                    "flight_segments": flight_segments,
                    "layovers": [],
                    "rating": 4.0,
                    "amenities": self._extract_amenities_from_extensions(flight.get("extensions", []))
                }
                
                parsed_flights.append(parsed_flight)
                
            except Exception as e:
                logger.error(f"Error parsing selected flight: {str(e)}")
                continue
        
        return parsed_flights

    def _extract_amenities_from_extensions(self, extensions: List[str]) -> List[str]:
        """
        Extract amenities from flight extensions
        """
        amenities = []
        for ext in extensions:
            ext_lower = ext.lower()
            if "wi-fi" in ext_lower or "wifi" in ext_lower:
                amenities.append("WiFi")
            if "usb" in ext_lower or "power" in ext_lower or "outlet" in ext_lower:
                amenities.append("Power Outlets")
            if "entertainment" in ext_lower or "video" in ext_lower:
                amenities.append("Entertainment")
            if "meal" in ext_lower or "food" in ext_lower:
                amenities.append("Meal")
            if "legroom" in ext_lower:
                amenities.append("Premium Legroom")
            if "suite" in ext_lower:
                amenities.append("Individual Suite")
            if "lie flat" in ext_lower:
                amenities.append("Lie Flat Seat")
        
        # Default amenities if none found
        if not amenities:
            amenities = ["WiFi", "Entertainment"]
        
        return list(set(amenities))  # Remove duplicates

    def _parse_booking_options(self, booking_options: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Parse booking options from SERP API response
        """
        parsed_options = []
        
        for option in booking_options:
            parsed_option = {
                "separate_tickets": option.get("separate_tickets", False)
            }
            
            # Parse together option
            if "together" in option:
                parsed_option["together"] = self._parse_booking_option_detail(option["together"])
            
            # Parse departing option (for separate tickets)
            if "departing" in option:
                parsed_option["departing"] = self._parse_booking_option_detail(option["departing"])
            
            # Parse returning option (for separate tickets)
            if "returning" in option:
                parsed_option["returning"] = self._parse_booking_option_detail(option["returning"])
            
            parsed_options.append(parsed_option)
        
        return parsed_options

    def _parse_booking_option_detail(self, option_detail: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse individual booking option detail
        """
        return {
            "book_with": option_detail.get("book_with", ""),
            "airline_logos": option_detail.get("airline_logos", []),
            "marketed_as": option_detail.get("marketed_as", []),
            "price": option_detail.get("price", 0),
            "local_prices": option_detail.get("local_prices", []),
            "option_title": option_detail.get("option_title", ""),
            "extensions": option_detail.get("extensions", []),
            "baggage_prices": option_detail.get("baggage_prices", []),
            "booking_request": option_detail.get("booking_request", {}),
            "booking_phone": option_detail.get("booking_phone", ""),
            "estimated_phone_service_fee": option_detail.get("estimated_phone_service_fee", 0)
        }

 