
export class Candlestick {
    constructor(
      public city: string,
      public timeframe: '15m' | '30m' | '1h',
      public timestamp: number,
      public open: number,
      public high: number,
      public low: number,
      public close: number,
      public volume: number = 1
    ) {}
  
    static fromTemperatureData(
      city: string,
      timeframe: '15m' | '30m' | '1h',
      timestamp: number,
      temperatures: number[]
    ): Candlestick {
      if (temperatures.length === 0) {
        throw new Error('Cannot create candlestick from empty temperature data');
      }
  
      const open = temperatures[0];
      const close = temperatures[temperatures.length - 1];
      const high = Math.max(...temperatures);
      const low = Math.min(...temperatures);
      const volume = temperatures.length;
  
      return new Candlestick(city, timeframe, timestamp, open, high, low, close, volume);
    }
  
    update(temperature: number): void {
      this.close = temperature;
      this.high = Math.max(this.high, temperature);
      this.low = Math.min(this.low, temperature);
      this.volume += 1;
    }
  }