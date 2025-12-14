"""
AirIQ Response Mapper - Converts AirIQ API responses to frontend-expected format
"""
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class AirIQMapper:
    """Maps AirIQ API responses to frontend format"""
    
    @staticmethod
    def map_availability_to_flights(availability_response: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Map AirIQ availability response to frontend flight format"""
        flights = []
        
        try:
            itinerary_list = availability_response.get("ItineraryFlightList", [])
            track_id = availability_response.get("Trackid", "")
            
            for itinerary in itinerary_list:
                items = itinerary.get("Items", [])
                
                for item in items:
                    flight_details = item.get("FlightDetails", [])
                    fares = item.get("Fares", [])
                    
                    if not flight_details or not fares:
                        continue
                    
                    # Get fare information
                    fare = fares[0]
                    fare_desc = fare.get("Faredescription", [])
                    if not fare_desc:
                        continue
                    
                    pax_fare = fare_desc[0]
                    gross_amount = float(pax_fare.get("GrossAmount", 0))
                    base_amount = float(pax_fare.get("BaseAmount", 0))
                    
                    # Parse flight segments
                    flight_segments = []
                    total_duration_minutes = 0
                    
                    for idx, flight_detail in enumerate(flight_details):
                        # Parse departure datetime
                        dep_datetime_str = flight_detail.get("DepartureDateTime", "")
                        dep_parsed = AirIQMapper._parse_datetime(dep_datetime_str)
                        
                        # Parse arrival datetime
                        arr_datetime_str = flight_detail.get("ArrivalDateTime", "")
                        arr_parsed = AirIQMapper._parse_datetime(arr_datetime_str)
                        
                        # Calculate duration
                        journey_time = flight_detail.get("JourneyTime", "")
                        duration_minutes = AirIQMapper._parse_journey_time(journey_time)
                        total_duration_minutes += duration_minutes
                        
                        # Format duration string
                        hours = duration_minutes // 60
                        minutes = duration_minutes % 60
                        duration_str = f"{hours}h {minutes}m" if hours > 0 else f"{minutes}m"
                        
                        # Get airline info
                        airline_code = flight_detail.get("AirlineDescription", "")
                        flight_number = flight_detail.get("FlightNumber", "")
                        
                        # Create segment
                        segment = {
                            "id": f"seg_{idx}",
                            "airline": airline_code,
                            "airline_logo": "",  # AirIQ doesn't provide logos
                            "flight_number": flight_number,
                            "departure": {
                                "airport": flight_detail.get("Origin", ""),
                                "airport_name": "",
                                "time": dep_parsed.get("time", ""),
                                "date": dep_parsed.get("date", "")
                            },
                            "arrival": {
                                "airport": flight_detail.get("Destination", ""),
                                "airport_name": "",
                                "time": arr_parsed.get("time", ""),
                                "date": arr_parsed.get("date", "")
                            },
                            "duration": duration_str,
                            "duration_minutes": duration_minutes,
                            "amenities": AirIQMapper._extract_amenities(flight_detail),
                            "aircraft": flight_detail.get("SegmentDetails", "").split("Aircraft Type :")[1].split("\\r")[0].strip() if "Aircraft Type" in flight_detail.get("SegmentDetails", "") else "Unknown",
                            "travel_class": AirIQMapper._map_cabin(flight_detail.get("Cabin", "E")),
                            "legroom": "",
                            "overnight": "Overnight" in flight_detail.get("SegmentDetails", ""),
                            "often_delayed": False,
                            "ticket_also_sold_by": [],
                            "plane_and_crew_by": ""
                        }
                        
                        flight_segments.append(segment)
                    
                    # Calculate total duration
                    total_hours = total_duration_minutes // 60
                    total_mins = total_duration_minutes % 60
                    total_duration_str = f"{total_hours}h {total_mins}m"
                    
                    # Count stops
                    stops = len(flight_details) - 1
                    
                    # Create flight object
                    flight = {
                        "id": f"airiq_{flight_details[0].get('FlightID', '')}",
                        "price": gross_amount,
                        "currency": fare.get("Currency", "INR"),
                        "stops": stops,
                        "total_duration": total_duration_str,
                        "total_duration_minutes": total_duration_minutes,
                        "flight_type": "Round Trip" if len(flight_details) > 1 else "One Way",
                        "airline_logo": "",
                        "departure_token": "",
                        "booking_token": track_id,  # Use track_id as booking token
                        "carbon_emissions": {
                            "this_flight": 0,
                            "typical_for_route": 0,
                            "difference_percent": 0
                        },
                        "extensions": [],
                        "flight_segments": flight_segments,
                        "layovers": AirIQMapper._extract_layovers(flight_details),
                        "rating": 4.0,
                        "amenities": list(set([a for seg in flight_segments for a in seg.get("amenities", [])]))
                    }
                    
                    flights.append(flight)
            
            return flights
            
        except Exception as e:
            logger.error(f"Error mapping availability response: {str(e)}")
            return []
    
    @staticmethod
    def _parse_datetime(date_str: str) -> Dict[str, str]:
        """Parse AirIQ datetime format (DD MMM YYYY HH:MM)"""
        try:
            dt = datetime.strptime(date_str, "%d %b %Y %H:%M")
            return {
                "time": dt.strftime("%H:%M"),
                "date": dt.strftime("%Y-%m-%d")
            }
        except:
            return {"time": "", "date": ""}
    
    @staticmethod
    def _parse_journey_time(journey_time: str) -> int:
        """Parse journey time to minutes"""
        try:
            # Journey time might be in format like "2h 30m" or "150" (minutes)
            if isinstance(journey_time, (int, float)):
                return int(journey_time)
            
            journey_time = str(journey_time).strip()
            
            # If it's just a number, assume minutes
            if journey_time.isdigit():
                return int(journey_time)
            
            # Parse "Xh Ym" format
            hours = 0
            minutes = 0
            
            if "h" in journey_time:
                parts = journey_time.split("h")
                hours = int(parts[0].strip())
                if len(parts) > 1 and "m" in parts[1]:
                    minutes = int(parts[1].replace("m", "").strip())
            elif "m" in journey_time:
                minutes = int(journey_time.replace("m", "").strip())
            
            return hours * 60 + minutes
            
        except:
            return 0
    
    @staticmethod
    def _map_cabin(cabin_code: str) -> str:
        """Map AirIQ cabin code to readable name"""
        cabin_map = {
            "E": "Economy",
            "P": "Premium Economy",
            "B": "Business",
            "F": "First Class"
        }
        return cabin_map.get(cabin_code.upper(), "Economy")
    
    @staticmethod
    def _extract_amenities(flight_detail: Dict[str, Any]) -> List[str]:
        """Extract amenities from flight details"""
        amenities = []
        segment_details = flight_detail.get("SegmentDetails", "")
        
        # Default amenities
        amenities.append("WiFi")
        amenities.append("Entertainment")
        
        # Check for baggage info
        if "Baggage" in segment_details:
            amenities.append("Baggage Included")
        
        return amenities
    
    @staticmethod
    def _extract_layovers(flight_details: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract layover information"""
        layovers = []
        
        # If multiple segments, there are layovers
        if len(flight_details) > 1:
            for i in range(len(flight_details) - 1):
                # Calculate layover time between segments
                current_arrival = flight_details[i].get("ArrivalDateTime", "")
                next_departure = flight_details[i + 1].get("DepartureDateTime", "")
                
                try:
                    arr_dt = datetime.strptime(current_arrival, "%d %b %Y %H:%M")
                    dep_dt = datetime.strptime(next_departure, "%d %b %Y %H:%M")
                    layover_minutes = int((dep_dt - arr_dt).total_seconds() / 60)
                    
                    layover = {
                        "duration": layover_minutes,
                        "airport": flight_details[i].get("Destination", ""),
                        "airport_name": "",
                        "overnight": layover_minutes > 480  # More than 8 hours
                    }
                    layovers.append(layover)
                except:
                    pass
        
        return layovers
    
    @staticmethod
    def map_pricing_response(pricing_response: Dict[str, Any]) -> Dict[str, Any]:
        """Map pricing response to frontend format"""
        try:
            price_info = pricing_response.get("PriceItenaryInfo", {})
            
            return {
                "track_id": pricing_response.get("TrackId", ""),
                "pricing_details": price_info,
                "status": pricing_response.get("ResponseStatus", {})
            }
        except Exception as e:
            logger.error(f"Error mapping pricing response: {str(e)}")
            return {}
    
    @staticmethod
    def map_booking_response(booking_response: Dict[str, Any]) -> Dict[str, Any]:
        """Map booking response to frontend format"""
        try:
            booking_data = booking_response.get("Bookingresponse", {})
            itinerary_details = booking_data.get("ItinearyDetails", [])
            
            if not itinerary_details:
                return {
                    "success": False,
                    "message": booking_response.get("Status", {}).get("Error", "Booking failed"),
                    "track_id": booking_response.get("TrackId", "")
                }
            
            # Get first itinerary
            itinerary = itinerary_details[0]
            
            return {
                "success": True,
                "track_id": booking_response.get("TrackId", ""),
                "airiq_pnr": itinerary.get("AirIqPNR", ""),
                "airline_pnr": itinerary.get("AirlinePNR", ""),
                "booking_amount": float(itinerary.get("TotalAmount", 0)),
                "booking_status": "CONFIRMED" if itinerary.get("Item", [{}])[0].get("TicketStatus") == "CONFIRMED" else "PENDING",
                "message": "Booking successful"
            }
        except Exception as e:
            logger.error(f"Error mapping booking response: {str(e)}")
            return {
                "success": False,
                "message": f"Error processing booking: {str(e)}"
            }

