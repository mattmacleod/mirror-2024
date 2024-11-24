import Dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const BASE_URL = "https://api.tfl.gov.uk"
const REFRESH_INTERVAL = 1000 * 60 * 1; // 1 minute

export interface ArrivalData {
  id: string;
  destination: string;
  expectedArrival: Dayjs.Dayjs;
}

export interface DisruptionData {
  description: string;
}

// The API type from the TFL API
interface TFLArrivalPrediction {
  id: string;
  stationName: string;
  direction: 'inbound' | 'outbound';
  destinationName: string;
  expectedArrival: string;
};

interface TFLDisruptionReport {
  description: string;
}

const fetchArrivals = async (stationCode: string): Promise<TFLArrivalPrediction[] | null> => {
  const url = `${BASE_URL}/StopPoint/${stationCode}/Arrivals`;

  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch arrivals data', error);
    return null;
  }
};

const fetchDisruptions = async (line: string): Promise<TFLDisruptionReport[] | null> => {
  const url = `${BASE_URL}/Line/${line}/Disruption`;

  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch disruptions data', error);
    return null;
  }
};

export const getArrivals = async (stationCode: string, direction?: 'inbound' | 'outbound'): Promise<ArrivalData[] | null> => {
  let data = await fetchArrivals(stationCode);
  if (!data) return null;

  if (direction) {
    data = data.filter((d) => d.direction === direction);
  }

  return data.map((arrival: any) => {
    return {
      id: arrival.id,
      destination: arrival.destinationName,
      expectedArrival: Dayjs(arrival.expectedArrival)
    }
  }).sort((a: ArrivalData, b: ArrivalData) => {
    return a.expectedArrival.isBefore(b.expectedArrival) ? -1 : 1;
  });
};

export const getDisruptions = async (line: string): Promise<DisruptionData[] | null> => {
  const data = await fetchDisruptions(line);
  if (!data) return null;

  return data.map((disruption: any) => {
    return {
      description: disruption.description
    }
  });
}

export const useArrivals = (stationCode: string, direction?: 'inbound' | 'outbound') => {
  const [arrivals, setArrivals] = useState<ArrivalData[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getArrivals(stationCode, direction);
      setArrivals(data);
    };

    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [stationCode, direction]);

  return arrivals;
}

export const useDisruptions = (line: string) => {
  const [disruptions, setDisruptions] = useState<TFLDisruptionReport[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchDisruptions(line);
      setDisruptions(data);
    };

    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [line]);

  return disruptions;
}
