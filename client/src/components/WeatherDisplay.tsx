import React from 'react';
import Card from './ui/Card';
import { WeatherData } from '../services/api';

interface WeatherDisplayProps {
  weatherData: WeatherData;
  className?: string;
  compact?: boolean;
}

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({
  weatherData,
  className = '',
  compact = false
}) => {
  if (!weatherData) {
    return null;
  }

  const { location, current, recommendations } = weatherData;

  const getWeatherIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('clear')) return '☀️';
    if (desc.includes('cloud')) return '☁️';
    if (desc.includes('rain')) return '🌧️';
    if (desc.includes('snow')) return '❄️';
    if (desc.includes('storm')) return '⛈️';
    if (desc.includes('fog') || desc.includes('mist')) return '🌫️';
    return '🌤️';
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 10) return 'text-blue-600 dark:text-blue-400';
    if (temp < 20) return 'text-green-600 dark:text-green-400';
    if (temp < 30) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (compact) {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getWeatherIcon(current.description)}</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {location.city}, {location.country}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {current.description}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${getTemperatureColor(current.temperature)}`}>
              {Math.round(current.temperature)}°C
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Feels like {Math.round(current.feels_like)}°C
            </p>
          </div>
        </div>
        
        {/* Weather Details Row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
          <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <span className="font-medium">Humidity:</span>
              <span>{current.humidity}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-medium">Wind:</span>
              <span>{current.wind_speed} m/s</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-medium">Pressure:</span>
              <span>{current.pressure} hPa</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-medium">Visibility:</span>
              <span>{current.visibility} km</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">Location:</span> {location.coordinates.lat.toFixed(2)}, {location.coordinates.lon.toFixed(2)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-4xl">{getWeatherIcon(current.description)}</span>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {location.city}, {location.country}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 capitalize">
                {current.description}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-4xl font-bold ${getTemperatureColor(current.temperature)}`}>
              {Math.round(current.temperature)}°C
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Feels like {Math.round(current.feels_like)}°C
            </p>
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Humidity</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {current.humidity}%
            </p>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Wind Speed</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {current.wind_speed} m/s
            </p>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Pressure</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {current.pressure} hPa
            </p>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Visibility</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {current.visibility} km
            </p>
          </div>
        </div>

        {/* Weather Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center">
              💡 Weather Recommendations
            </h4>
            <ul className="space-y-1">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm text-amber-700 dark:text-amber-300 flex items-start">
                  <span className="mr-2">•</span>
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Coordinates */}
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          📍 {location.coordinates.lat.toFixed(4)}, {location.coordinates.lon.toFixed(4)}
        </div>
      </div>
    </Card>
  );
};
