import React, { useState, useEffect } from 'react';
import { WeatherData } from '../services/api';
import { weatherAPI } from '../services/cachedApi';
import Card from './ui/Card';
import LoadingSpinner from './LoadingSpinner';

interface WeatherCardProps {
  city: string;
  countryCode?: string;
  className?: string;
  compact?: boolean;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  city,
  countryCode,
  className = '',
  compact = false
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await weatherAPI.getCurrentWeather(city, countryCode);
        setWeatherData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch weather');
      } finally {
        setLoading(false);
      }
    };

    if (city) {
      fetchWeather();
    }
  }, [city, countryCode]);

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 10) return 'text-blue-600';
    if (temp < 20) return 'text-green-600';
    if (temp < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card className={`p-3 ${className}`}>
        <div className="flex items-center justify-center h-16">
          <LoadingSpinner size="sm" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-3 ${className}`}>
        <div className="text-center text-red-600">
          <div className="text-lg">🌤️</div>
          <p className="text-xs">Weather unavailable</p>
        </div>
      </Card>
    );
  }

  if (!weatherData) {
    return null;
  }

  if (compact) {
    return (
      <Card className={`p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={getWeatherIcon(weatherData.current.icon)}
              alt={weatherData.current.description}
              className="w-8 h-8"
            />
            <div>
              <div className={`text-lg font-bold ${getTemperatureColor(weatherData.current.temperature)}`}>
                {Math.round(weatherData.current.temperature)}°C
              </div>
              <div className="text-xs text-gray-600 capitalize">
                {weatherData.current.description}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-800">
              {weatherData.location.city}
            </div>
            <div className="text-xs text-gray-600">
              {weatherData.current.humidity}% humidity
            </div>
          </div>
        </div>
        
        {/* Weather Details Row */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
          <div className="flex items-center space-x-3 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <span className="font-medium">Wind:</span>
              <span>{weatherData.current.wind_speed} m/s</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-medium">Pressure:</span>
              <span>{weatherData.current.pressure} hPa</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-medium">Visibility:</span>
              <span>{weatherData.current.visibility} km</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            <span className="font-medium">Feels like:</span> {Math.round(weatherData.current.feels_like)}°C
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {weatherData.location.city}, {weatherData.location.country}
          </h3>
          <p className="text-sm text-gray-600">
            Current weather
          </p>
        </div>
        <img
          src={getWeatherIcon(weatherData.current.icon)}
          alt={weatherData.current.description}
          className="w-12 h-12"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div className={`text-2xl font-bold ${getTemperatureColor(weatherData.current.temperature)}`}>
            {Math.round(weatherData.current.temperature)}°C
          </div>
          <div className="text-sm text-gray-600">
            Feels like {Math.round(weatherData.current.feels_like)}°C
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-medium capitalize text-gray-800">
            {weatherData.current.description}
          </div>
          <div className="text-sm text-gray-600">
            {weatherData.current.humidity}% humidity
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
        <div className="text-center">
          <div className="font-medium">Wind</div>
          <div>{weatherData.current.wind_speed} m/s</div>
        </div>
        <div className="text-center">
          <div className="font-medium">Pressure</div>
          <div>{weatherData.current.pressure} hPa</div>
        </div>
        <div className="text-center">
          <div className="font-medium">Visibility</div>
          <div>{weatherData.current.visibility} km</div>
        </div>
      </div>

      {/* Top recommendation */}
      {weatherData.recommendations && weatherData.recommendations.length > 0 && (
        <div className="mt-3 p-2 bg-blue-50 rounded-lg">
          <div className="text-xs font-medium text-blue-800 mb-1">💡 Travel Tip</div>
          <div className="text-xs text-blue-700">
            {weatherData.recommendations[0]}
          </div>
        </div>
      )}
    </Card>
  );
};

export default WeatherCard;
