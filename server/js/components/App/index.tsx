import Clock from '../Clock';
import TFLArrivals from '../TFLArrivals';
import Weather from '../Weather';

const App = () => {
  return (
    <div className='h-full w-full bg-black text-white relative'>
      <div className='fixed top-0 w-full flex'>
        <div className='w-1/2'>
          <Clock />
        </div>
        <div className='w-1/2'>
          <Weather />
        </div>
      </div>
      <div className='fixed bottom-0 w-full flex'>
        <TFLArrivals
          title='Forest Gate via Stratford'
          line='elizabeth'
          stationCode='910GFRSTGT'
          direction='outbound'
        />
        <TFLArrivals
          title='Wanstead Park'
          line='london-overground'
          stationCode='910GWNSTDPK'
        />
      </div>
    </div>
  );
}

export default App;
