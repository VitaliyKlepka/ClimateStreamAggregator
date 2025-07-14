
export interface Candlestick {
  id: number;
  city: string;
  timeframe: '15m' | '30m' | '1h';
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  created_at: Date;
  updated_at: Date;
}
