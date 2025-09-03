import React, { useState } from 'react';
import { WeatherWidget, WeatherCard } from '../components/WeatherWidget';
import { Card } from '../components/ui/Card';

const WeatherTestPage: React.FC = () => {
  const [city, setCity] = useState('Riyadh');
  const [countryCode, setCountryCode] = useState('SA');
  const [showForecast, setShowForecast] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            🌤️ Weather Integration Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the weather API integration with your SafarBot application
          </p>
        </div>

        {/* Controls */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter city name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country Code (Optional)
              </label>
              <input
                type="text"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., SA, US, GB"
                maxLength={2}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showForecast}
                  onChange={(e) => setShowForecast(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Show 5-day forecast
                </span>
              </label>
            </div>
          </div>
        </Card>

        {/* Weather Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Full Weather Widget */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Full Weather Widget
            </h2>
            <WeatherWidget
              city={city}
              countryCode={countryCode || undefined}
              showForecast={showForecast}
            />
          </div>

          {/* Compact Weather Card */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Compact Weather Card
            </h2>
            <WeatherCard
              city={city}
              countryCode={countryCode || undefined}
              compact={false}
            />
          </div>
        </div>

        {/* Compact Version */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Compact Version (for sidebars)
          </h2>
          <div className="max-w-md">
            <WeatherCard
              city={city}
              countryCode={countryCode || undefined}
              compact={true}
            />
          </div>
        </div>

        {/* API Test Results */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🧪 API Test Results
          </h2>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Expected API Response for {city}, {countryCode}:
            </h3>
            <pre className="text-sm text-gray-600 dark:text-gray-400 overflow-x-auto">
{`{
  "location": {
    "city": "${city}",
    "country": "${countryCode}",
    "coordinates": {
      "lat": 24.6877,
      "lon": 46.7219
    }
  },
  "current": {
    "temperature": 35.59,
    "feels_like": 32.9,
    "humidity": 11,
    "pressure": 1002,
    "description": "clear sky",
    "icon": "01n",
    "wind_speed": 4.19,
    "wind_direction": 47,
    "visibility": 10.0,
    "uv_index": 0
  },
  "recommendations": [
    "Pack light, breathable clothing - temperatures are hot",
    "Perfect weather for outdoor activities - bring sun protection",
    "Low humidity - use moisturizer and stay hydrated"
  ],
  "timestamp": "2025-01-15T20:58:55.484026"
}`}
            </pre>
          </div>
        </Card>

        {/* Integration Notes */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            📋 Integration Notes
          </h2>
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">✅ What's Working:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Weather API integration with OpenWeatherMap</li>
                <li>Real-time weather data fetching</li>
                <li>Smart weather-based recommendations</li>
                <li>Responsive weather components</li>
                <li>Error handling and loading states</li>
                <li>Integration with itinerary generation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">🔧 Usage:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Add WeatherCard to any page: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">&lt;WeatherCard city="London" /&gt;</code></li>
                <li>Use WeatherWidget for full weather display with forecast</li>
                <li>Weather data automatically integrates with AI itinerary generation</li>
                <li>Components handle loading states and errors gracefully</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WeatherTestPage;
