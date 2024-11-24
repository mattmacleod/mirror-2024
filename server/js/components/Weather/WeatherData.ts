import { WeatherApiResponse } from '@openmeteo/sdk/weather-api-response';
import { fetchWeatherApi } from 'openmeteo';
import { useEffect, useState } from 'react';
import Dayjs from 'dayjs';

// Data structure for the weather data we want to use
export interface WeatherData {
  current: {
    temperature: number;
    isDay: boolean;
    weatherCode: number;
  };
  hourly: {
    time: Dayjs.Dayjs;
    temperature: number;
    precipitationProbability: number;
    weatherCode: number;
  }[];
  daily: {
    time: Dayjs.Dayjs;
    weatherCode: number;
    maxTemperature: number;
    minTemperature: number;
  }[];
}

// Base API URL for the OpenMeteo API
const API_URL = 'https://api.open-meteo.com/v1/forecast';

// const REFRESH_INTERVAL = 1000 * 60 * 5; // 5 minutes
const REFRESH_INTERVAL = 1000 * 60 * 1; // 1 minute

// Fetch weather data from the OpenMeteo API
const doFetch = async () => {
  const params = {
    "latitude": 51.5508,
    "longitude": 0.0237,
    "current": ["temperature_2m", "is_day", "weather_code"],
    "hourly": ["temperature_2m", "precipitation_probability", "weather_code"],
    "daily": ["weather_code", "temperature_2m_max", "temperature_2m_min"],
    "timezone": "Europe/London",
    "forecast_days": 4
  };

  try {
    return (await fetchWeatherApi(API_URL, params))[0];
  } catch (error) {
    console.error('Failed to fetch weather data', error);
    return null;
  }
};

// Process the weather data into our own data structure
const processWeatherData = (response: WeatherApiResponse): WeatherData => {
  const currentResponse = response.current()!;
  const hourlyResponse = response.hourly()!;
  const dailyResponse = response.daily()!;

  const utcOffsetSeconds = response.utcOffsetSeconds();

  const range = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

  const hourlyTimes = range(Number(hourlyResponse.time()), Number(hourlyResponse.timeEnd()), hourlyResponse.interval()).map(
    (t) => Dayjs((t + utcOffsetSeconds) * 1000)
  );
  const dailyTimes = range(Number(dailyResponse.time()), Number(dailyResponse.timeEnd()), dailyResponse.interval()).map(
    (t) => Dayjs((t + utcOffsetSeconds) * 1000)
  );

  const hourly = hourlyTimes.map((time, i) => ({
    time,
    temperature: hourlyResponse.variables(0)!.valuesArray()![i],
    precipitationProbability: hourlyResponse.variables(1)!.valuesArray()![i],
    weatherCode: hourlyResponse.variables(2)!.valuesArray()![i],
  }));

  const current = {
    temperature: currentResponse.variables(0)!.value(),
    isDay: currentResponse.variables(1)!.value() === 1,
    weatherCode: currentResponse.variables(2)!.value(),
  };

  const daily = dailyTimes.map((time, i) => ({
    time,
    weatherCode: dailyResponse.variables(0)!.valuesArray()![i],
    maxTemperature: dailyResponse.variables(1)!.valuesArray()![i],
    minTemperature: dailyResponse.variables(2)!.valuesArray()![i],
  }));

  return { current, hourly, daily };
};

// React hook to fetch and process the data periodically
export const useWeatherData = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const responses = await doFetch();
      if (responses) {
        setWeatherData(processWeatherData(responses));
      }
    };

    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return weatherData;
};
