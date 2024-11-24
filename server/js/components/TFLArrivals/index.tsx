import Dayjs from 'dayjs';
import { ArrivalData, DisruptionData, useArrivals, useDisruptions } from './ArrivalsData';

interface Props {
  title: string;
  line: string;
  stationCode: string;
  maxCount?: number;
  direction?: 'inbound' | 'outbound';
}

const TFLArrivals = ({ title, line, stationCode, direction, maxCount = 5 }: Props) => {
  let arrivalsData = useArrivals(stationCode, direction);
  let disruptionData = useDisruptions(line);

  const loading = !arrivalsData && !disruptionData;

  return (
    <div className='flex flex-col flex-1 p-8'>
      <div className='text-2xl mb-4'>
        { title }
      </div>
      { loading ? <LoadingMessage /> : null }
      { arrivalsData ? <ArrivalsContent data={arrivalsData} maxCount={maxCount} /> : null }
      { disruptionData ? <DisruptionContent data={disruptionData} /> : null }
    </div>
  );
};

const LoadingMessage = () => <div>Loading...</div>;

const ArrivalsContent = ({ data, maxCount }: { data: ArrivalData[]; maxCount: number }) => {
  if (data.length === 0) {
    return <div>No arrivals</div>;
  }

  // Remove any items that are less than one minute away
  data = data.filter((arrival) => arrival.expectedArrival.diff(Dayjs(), 'minutes') > 1);

  // Limit the number of items to show
  data = data.slice(0, maxCount);

  return (
    <table className=''>
      <tbody>
        { data.map((arrival) => <ArrivalRow key={arrival.id} arrival={arrival} />) }
      </tbody>
    </table>
  );
}

const ArrivalRow = ({ arrival }: { arrival: ArrivalData }) => {
  const minutesUntil = arrival.expectedArrival.diff(Dayjs(), 'minutes');
  const timeIndicator = minutesUntil < 60 ? (
    <div className='text-xs font-bold'>
      { minutesUntil } minutes
    </div>
  ) : null;

  return (
    <tr className='flex' key={ arrival.id }>
      <td>{ arrival.expectedArrival.format('HH:mm') }</td>
      <td className='pl-4 pb-2 w-full'>
        { formatName(arrival.destination) }<br/>
        { timeIndicator }
      </td>
      <td>
      </td>
    </tr>
  );
};

const DisruptionContent = ({ data }: { data: DisruptionData[] }) => {
  if (data.length === 0) return null;

  return (
    <div className='mt-4'>
      {
        data.map((disruption) => (
          <div key={disruption.description} className='p-2 border-2'>
            { disruption.description }
          </div>
        ))
      }
    </div>
  );
};

const formatName = (name: string) => name.replace(' Rail Station', '');

export default TFLArrivals;
