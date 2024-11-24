import { useEffect, useState } from 'react';
import Dayjs from 'dayjs';

const UPDATE_INTERVAL = 1000;

const Clock = () => {
  const currentTime = useCurrentTime();

  return (
    <div className='px-16 py-8'>
      <div className='text-[110px] leading-none font-light'>
        <span>{currentTime.format('HH')}</span>
        <span className='-mx-4 relative -top-[10px]'>:</span>
        <span>{currentTime.format('mm')}</span>
        <span className='text-[30px] relative -top-[55px]'>{currentTime.format('ss')}</span>
      </div>
      <div className='text-2xl'>
        {currentTime.format('dddd Do MMMM')}
      </div>
    </div>
  );
};

const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(() => Dayjs());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Dayjs());
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return currentTime;
};

export default Clock;
