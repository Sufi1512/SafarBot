import asyncio
from datetime import datetime, date, timedelta
import random
from bson import ObjectId

from database import Database, get_collection
from mongo_models import (
    FlightDocument, HotelDocument, RestaurantDocument,
    FlightStatus, HotelType, AffiliatePartner
)

async def seed_flights():
    """Seed sample flight data."""
    collection = get_collection("flights")
    
    # Clear existing data
    await collection.delete_many({})
    
    airlines = [
        {"name": "Emirates", "logo": "https://example.com/emirates.png"},
        {"name": "Qatar Airways", "logo": "https://example.com/qatar.png"},
        {"name": "Etihad Airways", "logo": "https://example.com/etihad.png"},
        {"name": "Turkish Airlines", "logo": "https://example.com/turkish.png"},
        {"name": "Lufthansa", "logo": "https://example.com/lufthansa.png"},
        {"name": "British Airways", "logo": "https://example.com/ba.png"},
        {"name": "Air France", "logo": "https://example.com/airfrance.png"},
        {"name": "KLM", "logo": "https://example.com/klm.png"}
    ]
    
    routes = [
        {"from": "Dubai", "to": "London", "base_price": 450},
        {"from": "Dubai", "to": "New York", "base_price": 850},
        {"from": "Dubai", "to": "Paris", "base_price": 550},
        {"from": "Dubai", "to": "Tokyo", "base_price": 750},
        {"from": "Dubai", "to": "Singapore", "base_price": 400},
        {"from": "Dubai", "to": "Istanbul", "base_price": 300},
        {"from": "Dubai", "to": "Mumbai", "base_price": 250},
        {"from": "Dubai", "to": "Bangkok", "base_price": 350},
        {"from": "London", "to": "New York", "base_price": 600},
        {"from": "London", "to": "Paris", "base_price": 150},
        {"from": "London", "to": "Tokyo", "base_price": 900},
        {"from": "London", "to": "Singapore", "base_price": 700},
        {"from": "New York", "to": "Paris", "base_price": 650},
        {"from": "New York", "to": "Tokyo", "base_price": 1200},
        {"from": "New York", "to": "Singapore", "base_price": 1100}
    ]
    
    aircraft_types = ["Boeing 777", "Boeing 787", "Airbus A350", "Airbus A380", "Boeing 737"]
    travel_classes = ["economy", "premium_economy", "business", "first"]
    
    flights = []
    
    for route in routes:
        for _ in range(random.randint(3, 8)):  # 3-8 flights per route
            airline = random.choice(airlines)
            departure_date = date.today() + timedelta(days=random.randint(1, 90))
            departure_time = datetime.combine(departure_date, datetime.min.time().replace(hour=random.randint(6, 22)))
            duration_minutes = random.randint(60, 600)
            arrival_time = departure_time + timedelta(minutes=duration_minutes)
            
            base_price = route["base_price"]
            price_variation = random.uniform(0.8, 1.3)
            price = round(base_price * price_variation, 2)
            
            flight = {
                "flight_id": f"FL{random.randint(10000, 99999)}",
                "airline": airline["name"],
                "airline_logo": airline["logo"],
                "flight_number": f"{airline['name'][:2].upper()}{random.randint(100, 999)}",
                "departure_airport": f"{route['from'][:3].upper()}",
                "departure_city": route["from"],
                "departure_time": departure_time,
                "arrival_airport": f"{route['to'][:3].upper()}",
                "arrival_city": route["to"],
                "arrival_time": arrival_time,
                "duration_minutes": duration_minutes,
                "price": price,
                "currency": "USD",
                "available_seats": random.randint(10, 200),
                "status": FlightStatus.AVAILABLE,
                "amenities": random.sample(["WiFi", "Entertainment", "Meal", "Power Outlet", "USB Charger"], random.randint(2, 4)),
                "aircraft": random.choice(aircraft_types),
                "travel_class": random.choice(travel_classes),
                "stops": random.randint(0, 2),
                "layovers": [],
                "carbon_emissions": {
                    "this_flight": random.randint(100, 500),
                    "typical_for_route": random.randint(100, 500),
                    "difference_percent": random.randint(-20, 20)
                },
                "booking_url": f"https://booking.com/flight/{random.randint(10000, 99999)}",
                "affiliate_links": [
                    {
                        "partner": AffiliatePartner.BOOKING_COM,
                        "url": f"https://booking.com/flight/{random.randint(10000, 99999)}",
                        "commission_rate": 0.05
                    },
                    {
                        "partner": AffiliatePartner.SKYSCANNER,
                        "url": f"https://skyscanner.com/flight/{random.randint(10000, 99999)}",
                        "commission_rate": 0.03
                    }
                ],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            flights.append(flight)
    
    if flights:
        await collection.insert_many(flights)
        print(f"✅ Seeded {len(flights)} flights")

async def seed_hotels():
    """Seed sample hotel data."""
    collection = get_collection("hotels")
    
    # Clear existing data
    await collection.delete_many({})
    
    cities = [
        {"name": "Dubai", "country": "UAE"},
        {"name": "London", "country": "UK"},
        {"name": "New York", "country": "USA"},
        {"name": "Paris", "country": "France"},
        {"name": "Tokyo", "country": "Japan"},
        {"name": "Singapore", "country": "Singapore"},
        {"name": "Istanbul", "country": "Turkey"},
        {"name": "Mumbai", "country": "India"},
        {"name": "Bangkok", "country": "Thailand"},
        {"name": "Sydney", "country": "Australia"}
    ]
    
    hotel_chains = [
        "Marriott", "Hilton", "Hyatt", "InterContinental", "Four Seasons",
        "Ritz-Carlton", "W Hotels", "Sheraton", "Westin", "Renaissance"
    ]
    
    hotels = []
    
    for city in cities:
        for _ in range(random.randint(5, 15)):  # 5-15 hotels per city
            hotel_type = random.choice(list(HotelType))
            star_rating = random.randint(3, 5)
            
            # Price based on star rating and type
            base_price = 50 if hotel_type == HotelType.BUDGET else 150 if hotel_type == HotelType.MID_RANGE else 300
            price_variation = random.uniform(0.8, 1.5)
            price = round(base_price * price_variation, 2)
            
            hotel = {
                "hotel_id": f"HT{random.randint(10000, 99999)}",
                "name": f"{random.choice(hotel_chains)} {city['name']}",
                "address": f"{random.randint(1, 999)} {random.choice(['Main St', 'Park Ave', 'Broadway', '5th Ave', 'Oxford St'])}, {city['name']}",
                "city": city["name"],
                "country": city["country"],
                "latitude": random.uniform(-90, 90),
                "longitude": random.uniform(-180, 180),
                "hotel_type": hotel_type,
                "star_rating": star_rating,
                "price_per_night": price,
                "currency": "USD",
                "amenities": random.sample([
                    "Free WiFi", "Swimming Pool", "Gym", "Spa", "Restaurant",
                    "Bar", "Room Service", "Air Conditioning", "Free Breakfast",
                    "Parking", "Business Center", "Concierge"
                ], random.randint(5, 10)),
                "description": f"Luxurious {hotel_type.value} hotel in the heart of {city['name']}. Perfect for both business and leisure travelers.",
                "images": [
                    f"https://example.com/hotels/{random.randint(1, 100)}.jpg",
                    f"https://example.com/hotels/{random.randint(1, 100)}.jpg",
                    f"https://example.com/hotels/{random.randint(1, 100)}.jpg"
                ],
                "rating": round(random.uniform(3.5, 5.0), 1),
                "review_count": random.randint(50, 1000),
                "available_rooms": random.randint(5, 50),
                "check_in_time": "15:00",
                "check_out_time": "11:00",
                "booking_url": f"https://booking.com/hotel/{random.randint(10000, 99999)}",
                "affiliate_links": [
                    {
                        "partner": AffiliatePartner.BOOKING_COM,
                        "url": f"https://booking.com/hotel/{random.randint(10000, 99999)}",
                        "commission_rate": 0.08
                    },
                    {
                        "partner": AffiliatePartner.AGODA,
                        "url": f"https://agoda.com/hotel/{random.randint(10000, 99999)}",
                        "commission_rate": 0.06
                    }
                ],
                "policies": {
                    "cancellation": "Free cancellation until 24 hours before check-in",
                    "check_in": "From 3:00 PM",
                    "check_out": "Until 11:00 AM",
                    "pets": "Not allowed",
                    "smoking": "Designated smoking areas only"
                },
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            hotels.append(hotel)
    
    if hotels:
        await collection.insert_many(hotels)
        print(f"✅ Seeded {len(hotels)} hotels")

async def seed_restaurants():
    """Seed sample restaurant data."""
    collection = get_collection("restaurants")
    
    # Clear existing data
    await collection.delete_many({})
    
    cuisines = [
        "Italian", "Chinese", "Japanese", "Indian", "Mexican", "French",
        "Thai", "Mediterranean", "American", "Lebanese", "Turkish", "Korean"
    ]
    
    cities = ["Dubai", "London", "New York", "Paris", "Tokyo", "Singapore"]
    price_ranges = ["$", "$$", "$$$", "$$$$"]
    
    restaurants = []
    
    for city in cities:
        for _ in range(random.randint(10, 25)):  # 10-25 restaurants per city
            cuisine = random.choice(cuisines)
            price_range = random.choice(price_ranges)
            
            restaurant = {
                "restaurant_id": f"RT{random.randint(10000, 99999)}",
                "name": f"{random.choice(['The', 'Le', 'La', 'El', 'Il'])} {random.choice(['Golden', 'Royal', 'Blue', 'Green', 'Red', 'White'])} {cuisine}",
                "cuisine": cuisine,
                "address": f"{random.randint(1, 999)} {random.choice(['Main St', 'Park Ave', 'Broadway', '5th Ave', 'Oxford St'])}, {city}",
                "city": city,
                "country": "Various",
                "latitude": random.uniform(-90, 90),
                "longitude": random.uniform(-180, 180),
                "price_range": price_range,
                "rating": round(random.uniform(3.0, 5.0), 1),
                "review_count": random.randint(20, 500),
                "specialties": random.sample([
                    "Pasta", "Sushi", "Curry", "Tacos", "Steak", "Seafood",
                    "Pizza", "Noodles", "Kebab", "Sushi", "Biryani", "Paella"
                ], random.randint(2, 4)),
                "description": f"Authentic {cuisine} cuisine in the heart of {city}. Perfect for a memorable dining experience.",
                "images": [
                    f"https://example.com/restaurants/{random.randint(1, 100)}.jpg",
                    f"https://example.com/restaurants/{random.randint(1, 100)}.jpg"
                ],
                "opening_hours": {
                    "Monday": "11:00 AM - 10:00 PM",
                    "Tuesday": "11:00 AM - 10:00 PM",
                    "Wednesday": "11:00 AM - 10:00 PM",
                    "Thursday": "11:00 AM - 10:00 PM",
                    "Friday": "11:00 AM - 11:00 PM",
                    "Saturday": "11:00 AM - 11:00 PM",
                    "Sunday": "12:00 PM - 9:00 PM"
                },
                "contact_info": {
                    "phone": f"+1-{random.randint(100, 999)}-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
                    "email": f"info@{random.choice(['restaurant', 'dining', 'food'])}.com"
                },
                "amenities": random.sample([
                    "Outdoor Seating", "Private Dining", "Wine List", "Live Music",
                    "WiFi", "Parking", "Delivery", "Takeout", "Reservations"
                ], random.randint(3, 6)),
                "dietary_options": random.sample([
                    "Vegetarian", "Vegan", "Gluten-Free", "Halal", "Kosher"
                ], random.randint(1, 3)),
                "booking_url": f"https://opentable.com/restaurant/{random.randint(10000, 99999)}",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            restaurants.append(restaurant)
    
    if restaurants:
        await collection.insert_many(restaurants)
        print(f"✅ Seeded {len(restaurants)} restaurants")

async def main():
    """Main seeding function."""
    print("🌱 Starting database seeding...")
    
    try:
        # Connect to database
        await Database.connect_db()
        print("✅ Connected to MongoDB")
        
        # Seed data
        await seed_flights()
        await seed_hotels()
        await seed_restaurants()
        
        print("🎉 Database seeding completed successfully!")
        
    except Exception as e:
        print(f"❌ Seeding failed: {e}")
        raise e
    finally:
        await Database.close_db()

if __name__ == "__main__":
    asyncio.run(main()) 