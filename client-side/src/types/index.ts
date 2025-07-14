export interface Candlestick {
  id: number;
  city: string;
  timeframe: '15m' | '30m' | '1h';
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  created_at: string;
}

export interface CandlestickApiResponse {
  success: boolean;
  data: Candlestick[];
  meta: {
    count: number;
    timeframe: string;
    from: number;
    to: number;
  };
}

export interface CandlestickFilters {
  city: string;
  timeframe: '15m' | '30m' | '1h';
  fromTimestamp: number;
  toTimestamp: number;
  limit?: number;
}

export interface ChartDataPoint {
  x: number; // timestamp
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
}

export const CITIES = [
  'Berlin',
  'NewYork', 
  'Tokyo',
  'SaoPaulo',
  'CapeTown'
] as const;

export const TIMEFRAMES = [
  { value: '15m', label: '15 Minutes' },
  { value: '30m', label: '30 Minutes' },
  { value: '1h', label: '1 Hour' }
] as const;

export type City = typeof CITIES[number];
export type Timeframe = '15m' | '30m' | '1h';