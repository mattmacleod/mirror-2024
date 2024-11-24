import Dayjs from 'dayjs';
import { weatherCodeToDescription, weatherCodeToIcon } from './WeatherCodes';
import { useWeatherData, WeatherData } from './WeatherData';

const Weather = () => {
  const data = useWeatherData();

  return (
    <div className='px-16 py-8'>
      {data ? <WeatherContent data={data} /> : <LoadingMessage />}
    </div>
  );
};

const LoadingMessage = () => <div>Loading...</div>;

const WeatherContent = ({ data }: { data: WeatherData }) => (
  <div>
    <CurrentWeather data={data} />
    <div className='flex flex-col float-right items-center'>
      <HourlyWeather data={data} />
      <DailyWeather data={data} />
    </div>
  </div>
);

const CurrentWeather = ({ data }: { data: WeatherData }) => {
  const Icon = weatherCodeToIcon(data.current.weatherCode, data.current.isDay);

  return (
    <div className='flex justify-end pb-8'>
      <div className='text-right pt-8 pr-8'>
        <div className='text-3xl'>
          {data.current.temperature.toFixed(0)}°C
        </div>
        <div className='text-xl'>
          {weatherCodeToDescription(data.current.weatherCode)}
        </div>
      </div>
      <div className='-m-4'>
        <Icon size={160} />
      </div>
    </div>
  );
};

const HourlyWeather = ({ data }: { data: WeatherData }) => {
  // Grab the hourly data for the next four hours only. We need to check the
  // timestamp of the data to ensure we don't include any data from the previous
  // hours.
  const interestingData = [];
  const now = Dayjs();
  for (const hour of data.hourly) {
    if (hour.time.isAfter(now)) {
      interestingData.push(hour);
    }
    if (interestingData.length === 4) {
      break;
    }
  }

  const rows = interestingData.map((hour) => <HourlyRow key={hour.time.toString()} hour={hour} />);

  return (
    <div className='flex justify-end gap-8 pt-4'>
      {rows}
    </div>
  );
};

const HourlyRow = ({ hour }: { hour: WeatherData["hourly"][0] }) => {
  const Icon = weatherCodeToIcon(hour.weatherCode, true);

  return (
    <div className='flex flex-col items-center'>
      <div className='flex-1 text-right'>
        {hour.time.format('HH:mm')}
      </div>
      <div className='flex-1 pb'>
        <Icon size={48} />
      </div>
      <div className='flex-1 text-lg'>
        {hour.temperature.toFixed(0)}°C
      </div>
      <div className='flex-1'>
        {hour.precipitationProbability.toFixed(0)}%
      </div>
    </div>
  );
};

const DailyWeather = ({ data }: { data: WeatherData }) => {
  // Grab days only starting from after now
  const interestingData = data.daily.filter((day) => day.time.isAfter(Dayjs()));
  const rows = interestingData.map((day) => <DailyRow key={day.time.toString()} day={day} />);

  return (
    <div className='flex justify-end gap-8 pt-6'>
      {rows}
    </div>
  );
};

const DailyRow = ({ day }: { day: WeatherData["daily"][0] }) => {
  const Icon = weatherCodeToIcon(day.weatherCode, true);

  return (
    <div className='flex flex-col items-center'>
      <div className='flex-1 text-right'>
        {day.time.format('ddd')}
      </div>
      <div className='flex-1'>
        {day.minTemperature.toFixed(0)}–{day.maxTemperature.toFixed(0)}°C
      </div>
      <div className='flex-1 pt'>
        <Icon size={36} />
      </div>
    </div>
  );
};

export default Weather;
