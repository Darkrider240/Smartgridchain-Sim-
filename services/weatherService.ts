import { WeatherData } from '../types';

// We use the Open-Meteo REST API directly to avoid npm dependencies in the browser environment.
export const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData | null> => {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      // We request shortwave_radiation (GHI) which is best for Solar PV estimates
      hourly: 'temperature_2m,shortwave_radiation', 
      daily: 'sunrise,sunset',
      forecast_days: '1',
      timezone: 'auto' // Returns data in the local time of the coordinates
    });

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Weather API failed');
    }

    const data = await response.json();

    return {
      hourly: {
        time: data.hourly.time,
        shortwave_radiation: data.hourly.shortwave_radiation,
        temperature_2m: data.hourly.temperature_2m
      },
      daily: {
        sunrise: data.daily.sunrise,
        sunset: data.daily.sunset
      }
    };
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    return null;
  }
};