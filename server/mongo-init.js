// MongoDB initialization script for SafarBot
// This script runs when the MongoDB container starts for the first time

// Switch to the safarbot database
db = db.getSiblingDB('safarbot');

// Create collections with proper indexes
db.createCollection('users');
db.createCollection('saved_itineraries');
db.createCollection('collaboration_rooms');
db.createCollection('notifications');
db.createCollection('bookings');
db.createCollection('weather_cache');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "user_id": 1 }, { unique: true });

db.saved_itineraries.createIndex({ "user_id": 1 });
db.saved_itineraries.createIndex({ "share_token": 1 }, { unique: true, sparse: true });
db.saved_itineraries.createIndex({ "is_public": 1 });
db.saved_itineraries.createIndex({ "created_at": -1 });

db.collaboration_rooms.createIndex({ "itinerary_id": 1 });
db.collaboration_rooms.createIndex({ "room_id": 1 }, { unique: true });

db.notifications.createIndex({ "user_id": 1 });
db.notifications.createIndex({ "created_at": -1 });

db.bookings.createIndex({ "user_id": 1 });
db.bookings.createIndex({ "booking_id": 1 }, { unique: true });

db.weather_cache.createIndex({ "location": 1 });
db.weather_cache.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 3600 });

// Create a default admin user (optional)
db.users.insertOne({
  "user_id": "admin",
  "email": "admin@safarbot.com",
  "username": "admin",
  "full_name": "SafarBot Admin",
  "is_verified": true,
  "role": "admin",
  "created_at": new Date(),
  "updated_at": new Date()
});

print("✅ SafarBot database initialized successfully!");
print("📊 Collections created: users, saved_itineraries, collaboration_rooms, notifications, bookings, weather_cache");
print("🔍 Indexes created for optimal performance");
print("👤 Default admin user created: admin@safarbot.com");
