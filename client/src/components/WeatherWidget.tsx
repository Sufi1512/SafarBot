import React, { useState, useEffect } from 'react';
import { weatherAPI, WeatherData, WeatherForecast } from '../services/api';
import { Card } from './ui/Card';
import { LoadingSpinner } from './LoadingSpinner';

interface WeatherWidgetProps {
  city: string;
  countryCode?: string;
  showForecast?: boolean;
  className?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  city,
  countryCode,
  showForecast = false,
  className = ''
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<WeatherForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch current weather
        const currentWeather = await weatherAPI.getCurrentWeather(city, countryCode);
        setWeatherData(currentWeather);

        // Fetch forecast if requested
        if (showForecast) {
          const forecast = await weatherAPI.getWeatherForecast(city, countryCode, 5);
          setForecastData(forecast);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    if (city) {
      fetchWeather();
    }
  }, [city, countryCode, showForecast]);

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 10) return 'text-blue-600';
    if (temp < 20) return 'text-green-600';
    if (temp < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-gray-600">Loading weather...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-center text-red-600">
          <div className="text-2xl mb-2">🌤️</div>
          <p className="text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  if (!weatherData) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Weather */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {weatherData.location.city}, {weatherData.location.country}
            </h3>
            <p className="text-sm text-gray-600">
              Updated {formatTime(weatherData.timestamp)}
            </p>
          </div>
          <img
            src={getWeatherIcon(weatherData.current.icon)}
            alt={weatherData.current.description}
            className="w-16 h-16"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className={`text-3xl font-bold ${getTemperatureColor(weatherData.current.temperature)}`}>
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
      </Card>

      {/* Weather Recommendations */}
      {weatherData.recommendations && weatherData.recommendations.length > 0 && (
        <Card className="p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">💡 Travel Tips</h4>
          <ul className="space-y-1">
            {weatherData.recommendations.map((recommendation, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <span className="mr-2">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Weather Forecast */}
      {showForecast && forecastData && (
        <Card className="p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">5-Day Forecast</h4>
          <div className="space-y-2">
            {forecastData.forecasts.slice(0, 5).map((forecast, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <img
                    src={getWeatherIcon(forecast.icon)}
                    alt={forecast.description}
                    className="w-8 h-8"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {new Date(forecast.datetime).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-gray-600 capitalize">
                      {forecast.description}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-800">
                    {Math.round(forecast.temperature.max)}° / {Math.round(forecast.temperature.min)}°
                  </div>
                  <div className="text-xs text-gray-600">
                    {forecast.humidity}% humidity
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default WeatherWidget;
