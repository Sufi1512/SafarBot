# Google Maps API Setup Guide

## Overview
This project now includes an interactive Google Maps component that displays all locations from your travel itinerary, including destinations, hotels, restaurants, and activities.

## Features
- 🗺️ **Interactive Map**: Shows all itinerary locations with custom markers
- 🏛️ **Destination Markers**: Blue markers for main destinations
- 🏨 **Hotel Markers**: Green markers for accommodations
- 🍽️ **Restaurant Markers**: Yellow markers for dining options
- 🎯 **Activity Markers**: Purple markers for sightseeing and activities
- 📍 **Info Windows**: Click markers to see details, ratings, and prices
- 🧭 **Auto-centering**: Map automatically centers on your locations
- 📱 **Responsive**: Works on all device sizes

## Setup Instructions

### 1. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API** and **Places API**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key

### 2. Add API Key to Environment
1. Copy `client/env.example` to `client/.env.local`
2. Add your Google Maps API key:
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

### 3. Restart Development Server
```bash
cd client
npm run dev
```

## API Key Security
- **Frontend Only**: This API key is safe to expose in frontend code
- **Restrictions**: Consider adding HTTP referrer restrictions in Google Cloud Console
- **Quotas**: Monitor your API usage in the Google Cloud Console

## Troubleshooting
- **Map Not Loading**: Check if API key is correct and APIs are enabled
- **No Markers**: Ensure your itinerary has location data
- **API Errors**: Check browser console for detailed error messages

## Map Legend
- 🔵 **Blue**: Main destination
- 🟢 **Green**: Hotels and accommodations
- 🟡 **Yellow**: Restaurants and dining
- 🟣 **Purple**: Activities and attractions

## Technical Details
- Uses `@react-google-maps/api` package
- Responsive grid layout (2/3 itinerary, 1/3 map)
- Sticky positioning for better UX
- Custom SVG markers with emojis
- Auto-bounds fitting for multiple locations


