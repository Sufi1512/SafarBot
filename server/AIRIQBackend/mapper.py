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
        """Map AirIQ availability response to frontend flight format
        
        AirIQ Response Structure:
        {
            "Trackid": "...",
            "ItineraryFlightList": [
                {
                    "Items": [
                        {
                            "FlightDetails": [...],
                            "Fares": [...]
                        },
                        {
                            "FlightDetails": [...],
                            "Fares": [...]
                        }
                    ]
                }
            ]
        }
        """
        flights = []
        
        try:
            itinerary_list = availability_response.get("ItineraryFlightList", [])
            track_id = availability_response.get("Trackid", "")
            
            # Each itinerary can have multiple items (different flight options)
            for itinerary_idx, itinerary in enumerate(itinerary_list):
                items = itinerary.get("Items", [])
                
                # Process each item in the Items array
                for item_idx, item in enumerate(items):
                    flight_details = item.get("FlightDetails", [])
                    fares = item.get("Fares", [])
                    
                    if not flight_details:
                        logger.warning(f"Skipping item {item_idx} in itinerary {itinerary_idx}: No FlightDetails")
                        continue
                    
                    # Get fare information - use first fare if available
                    gross_amount = 0
                    base_amount = 0
                    currency = "INR"
                    fare_type = "N"
                    fare_id = ""
                    taxes = []
                    total_tax_amount = 0
                    net_amount = 0
                    incentive = 0
                    service_charge = 0
                    tds = 0
                    discount = 0
                    plb_amount = 0
                    sf = 0
                    sfgst = 0
                    
                    if fares and len(fares) > 0:
                        fare = fares[0]
                        currency = fare.get("Currency", "INR")
                        fare_type = fare.get("FareType", "N")
                        fare_id = fare.get("FlightId", "")
                        
                        fare_desc = fare.get("Faredescription", [])
                        if fare_desc and len(fare_desc) > 0:
                            pax_fare = fare_desc[0]
                            gross_amount = float(pax_fare.get("GrossAmount", 0))
                            base_amount = float(pax_fare.get("BaseAmount", 0))
                            total_tax_amount = float(pax_fare.get("TotalTaxAmount", 0))
                            net_amount = float(pax_fare.get("NetAmount", 0))
                            incentive = float(pax_fare.get("Incentive", 0))
                            service_charge = float(pax_fare.get("Servicecharge", 0))
                            tds = float(pax_fare.get("TDS", 0))
                            discount = float(pax_fare.get("Discount", 0))
                            plb_amount = float(pax_fare.get("PLBAmount", 0))
                            sf = float(pax_fare.get("SF", 0))
                            sfgst = float(pax_fare.get("SFGST", 0))
                            taxes = pax_fare.get("Taxes", [])
                    
                    # Parse flight segments from FlightDetails array
                    flight_segments = []
                    total_duration_minutes = 0
                    
                    for seg_idx, flight_detail in enumerate(flight_details):
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
                        
                        # Create segment - preserve ALL AirIQ fields for booking/pricing
                        segment = {
                            "id": f"seg_{seg_idx}",
                            "airline": airline_code,
                            "airline_logo": "",
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
                            "aircraft": AirIQMapper._extract_aircraft(flight_detail),
                            "travel_class": AirIQMapper._map_cabin(flight_detail.get("Cabin", "E")),
                            "legroom": "",
                            "overnight": "Overnight" in flight_detail.get("SegmentDetails", ""),
                            "often_delayed": False,
                            "ticket_also_sold_by": [],
                            "plane_and_crew_by": "",
                            # Preserve ALL critical AirIQ fields for booking/pricing
                            "airiq_flight_id": flight_detail.get("FlightID", ""),
                            "reference_token": flight_detail.get("ReferenceToken", ""),
                            "seg_ref": flight_detail.get("SegRef", ""),
                            "itin_ref": flight_detail.get("ItinRef", ""),
                            "class": flight_detail.get("Class", ""),
                            "departure_terminal": flight_detail.get("DepartureTerminal", ""),
                            "arrival_terminal": flight_detail.get("ArrivalTerminal", ""),
                            "connection_flag": flight_detail.get("ConnectionFlag", ""),
                            "fare_id": flight_detail.get("FareId", ""),
                            "cabin": flight_detail.get("Cabin", ""),
                            "fare_basis_code": flight_detail.get("FareBasisCode", ""),
                            "stops": flight_detail.get("Stops", "0"),
                            "via": flight_detail.get("Via", ""),
                            "airline_category": flight_detail.get("AirlineCategory", ""),
                            "cnx": flight_detail.get("CNX", ""),
                            "plating_carrier": flight_detail.get("PlatingCarrier", ""),
                            "operating_carrier": flight_detail.get("OperatingCarrier", ""),
                            "segment_details": flight_detail.get("SegmentDetails", ""),
                            "flying_time": flight_detail.get("FlyingTime", ""),
                            "offline_indicator": flight_detail.get("OfflineIndicator", False),
                            "multi_class": flight_detail.get("MultiClass", ""),
                            "allow_fqt": flight_detail.get("AllowFQT", False),
                            "baggage": flight_detail.get("Baggage", ""),
                            "cabin_baggage": flight_detail.get("CabinBaggage", ""),
                            "fare_type_description": flight_detail.get("FareTypeDescription", ""),
                            "fare_description": flight_detail.get("FareDescription", ""),
                            "refundable": flight_detail.get("Refundable", "")
                        }
                        
                        flight_segments.append(segment)
                    
                    # Calculate total duration
                    total_hours = total_duration_minutes // 60
                    total_mins = total_duration_minutes % 60
                    total_duration_str = f"{total_hours}h {total_mins}m"
                    
                    # Count stops (number of segments - 1)
                    stops = len(flight_details) - 1
                    
                    # Get first flight's reference token (needed for pricing/booking)
                    first_flight_ref_token = flight_details[0].get("ReferenceToken", "") if flight_details else ""
                    first_flight_id = flight_details[0].get("FlightID", "") if flight_details else ""
                    
                    # Create flight object - preserve ALL critical AirIQ fields
                    flight = {
                        "id": f"airiq_{first_flight_id}_{item_idx}",
                        "price": gross_amount,
                        "base_amount": base_amount,
                        "currency": currency,
                        "stops": stops,
                        "total_duration": total_duration_str,
                        "total_duration_minutes": total_duration_minutes,
                        "flight_type": "Round Trip" if len(flight_details) > 1 else "One Way",
                        "airline_logo": "",
                        "departure_token": first_flight_ref_token,  # Use ReferenceToken as departure_token
                        "booking_token": track_id,
                        "carbon_emissions": {
                            "this_flight": 0,
                            "typical_for_route": 0,
                            "difference_percent": 0
                        },
                        "extensions": [],
                        "flight_segments": flight_segments,
                        "layovers": AirIQMapper._extract_layovers(flight_details),
                        "rating": 4.0,
                        "amenities": list(set([a for seg in flight_segments for a in seg.get("amenities", [])])),
                        # Preserve ALL critical AirIQ fields for booking/pricing
                        "airiq_flight_id": first_flight_id,
                        "reference_token": first_flight_ref_token,
                        "track_id": track_id,
                        "fare_id": fare_id,
                        "fare_type": fare_type,
                        "total_tax_amount": total_tax_amount,
                        "net_amount": net_amount,
                        "incentive": incentive,
                        "service_charge": service_charge,
                        "tds": tds,
                        "discount": discount,
                        "plb_amount": plb_amount,
                        "sf": sf,
                        "sfgst": sfgst,
                        "taxes": taxes,
                        "raw_flight_details": flight_details,  # Keep raw details for reference
                        "raw_fares": fares  # Keep raw fares for reference
                    }
                    
                    flights.append(flight)
            
            return flights
            
        except Exception as e:
            logger.error(f"Error mapping availability response: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
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
            if isinstance(journey_time, (int, float)):
                return int(journey_time)
            
            journey_time = str(journey_time).strip()
            
            if journey_time.isdigit():
                return int(journey_time)
            
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
    def _extract_aircraft(flight_detail: Dict[str, Any]) -> str:
        """Extract aircraft type from segment details"""
        try:
            segment_details = flight_detail.get("SegmentDetails", "")
            if "Aircraft Type :" in segment_details:
                return segment_details.split("Aircraft Type :")[1].split("\\r")[0].strip()
        except:
            pass
        return "Unknown"
    
    @staticmethod
    def _extract_amenities(flight_detail: Dict[str, Any]) -> List[str]:
        """Extract amenities from flight details"""
        amenities = []
        segment_details = flight_detail.get("SegmentDetails", "")
        
        amenities.append("WiFi")
        amenities.append("Entertainment")
        
        if "Baggage" in segment_details:
            amenities.append("Baggage Included")
        
        return amenities
    
    @staticmethod
    def _extract_layovers(flight_details: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract layover information"""
        layovers = []
        
        if len(flight_details) > 1:
            for i in range(len(flight_details) - 1):
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
                        "overnight": layover_minutes > 480
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

