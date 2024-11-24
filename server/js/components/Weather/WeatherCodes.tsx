import { IconType } from 'react-icons';
import { WiCloud, WiDayCloudy, WiDayFog, WiDayRain, WiDayShowers, WiDaySnow, WiDaySprinkle, WiDaySunny, WiDayThunderstorm, WiNa, WiNightAltCloudy, WiNightClear, WiNightFog, WiNightRain, WiNightShowers, WiNightSnow, WiNightSprinkle, WiNightThunderstorm } from 'react-icons/wi';

enum WeatherType {
  CLEAR,
  PARTLY_CLOUDY,
  CLOUDY,
  FOGGY,
  DRIZZLE,
  FREEZING_DRIZZLE,
  RAIN,
  FREEZING_RAIN,
  SNOW,
  RAIN_SHOWERS,
  SNOW_SHOWERS,
  THUNDERSTORM,
  UNKNOWN,
}

const codeToStatus = (code: number): WeatherType => {
  switch (code) {
    case 0:
      return WeatherType.CLEAR;
    case 1:
    case 2:
      return WeatherType.PARTLY_CLOUDY;
    case 3:
      return WeatherType.CLOUDY;
    case 45:
    case 48:
      return WeatherType.FOGGY;
    case 51:
    case 53:
    case 55:
      return WeatherType.DRIZZLE;
    case 56:
    case 57:
      return WeatherType.FREEZING_DRIZZLE;
    case 61:
    case 63:
    case 65:
      return WeatherType.RAIN;
    case 66:
    case 67:
      return WeatherType.FREEZING_RAIN;
    case 71:
    case 73:
    case 75:
    case 77:
      return WeatherType.SNOW;
    case 80:
    case 81:
    case 82:
      return WeatherType.RAIN_SHOWERS;
    case 85:
    case 86:
      return WeatherType.SNOW_SHOWERS;
    case 95:
    case 96:
    case 99:
      return WeatherType.THUNDERSTORM;
    default:
      return WeatherType.UNKNOWN;
  }
};

export const weatherCodeToDescription = (code: number): string => {
  const status = codeToStatus(code);

  switch (status) {
    case WeatherType.CLEAR:
      return 'Clear';
    case WeatherType.PARTLY_CLOUDY:
      return 'Partly Cloudy';
    case WeatherType.CLOUDY:
      return 'CLOUDY';
    case WeatherType.FOGGY:
      return 'Foggy';
    case WeatherType.DRIZZLE:
      return 'Drizzle';
    case WeatherType.FREEZING_DRIZZLE:
      return 'Freezing Drizzle';
    case WeatherType.RAIN:
      return 'Rain';
    case WeatherType.FREEZING_RAIN:
      return 'Freezing Rain';
    case WeatherType.SNOW:
      return 'Snow';
    case WeatherType.RAIN_SHOWERS:
      return 'Rain Showers';
    case WeatherType.SNOW_SHOWERS:
      return 'Snow Showers';
    case WeatherType.THUNDERSTORM:
      return 'Thunderstorm';
    case WeatherType.UNKNOWN:
      return 'Unknown';
  }
};

export const weatherCodeToIcon = (code: number, isDay: boolean): IconType => {
  const status = codeToStatus(code);

  switch (status) {
    case WeatherType.CLEAR:
      return isDay ? WiDaySunny : WiNightClear;
    case WeatherType.PARTLY_CLOUDY:
      return isDay ? WiDayCloudy : WiNightAltCloudy;
    case WeatherType.CLOUDY:
      return WiCloud;
    case WeatherType.FOGGY:
      return isDay ? WiDayFog : WiNightFog;
    case WeatherType.DRIZZLE:
    case WeatherType.FREEZING_DRIZZLE:
      return isDay ? WiDaySprinkle : WiNightSprinkle;
    case WeatherType.RAIN:
      return isDay ? WiDayRain : WiNightRain;
    case WeatherType.SNOW:
    case WeatherType.SNOW_SHOWERS:
      return isDay ? WiDaySnow : WiNightSnow;
    case WeatherType.RAIN_SHOWERS:
      return isDay ? WiDayShowers : WiNightShowers;
    case WeatherType.THUNDERSTORM:
      return isDay ? WiDayThunderstorm : WiNightThunderstorm;
    case WeatherType.UNKNOWN:
    default:
      return WiNa;
  }
};
