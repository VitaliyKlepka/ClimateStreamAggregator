import { RedisBuffer, TemperatureData } from '../infrastructure/redis';
import { CandlestickService } from './Candlestick.service';
import { injectable, inject } from 'inversify';
import { TYPES } from '../infrastructure/ioc/types';
import { Candlestick } from '../domain/candlestick/Candlestick.model';

@injectable()
export class AggregationService {
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(
    @inject(TYPES.CandlestickService) private candlestickService: CandlestickService,
    @inject(TYPES.RedisBuffer) private redisBuffer: RedisBuffer,
  ) {}

  async startPeriodicFlush(intervalMs: number = 60000): Promise<void> {
    console.log(`🔄 Starting periodic flush every ${intervalMs}ms`);
    
    this.flushInterval = setInterval(async () => {
      try {
        await this.flushAllTimeframes();
      } catch (error) {
        console.error('❌ Error during periodic flush:', error);
      }
    }, intervalMs);
  }

  private async flushAllTimeframes(): Promise<void> {
    const cities = ['Berlin', 'NewYork', 'Tokyo', 'SaoPaulo', 'CapeTown'];
    const timeframes: Array<'15m' | '30m' | '1h'> = ['15m', '30m', '1h'];
    
    console.log('🔄 Starting flush for all timeframes...');
    
    for (const city of cities) {
      for (const timeframe of timeframes) {
        console.log(`🔄 Flushing ${timeframe} for ${city}`);
        await this.flushCityTimeframe(city, timeframe);
      }
    }
    
    console.log('✅ Completed flush for all timeframes');
  }

  private async flushCityTimeframe(city: string, timeframe: '15m' | '30m' | '1h'): Promise<void> {
    try {
      const now = Date.now();
      const timeframeMs = this.getTimeframeMs(timeframe);
      
      // Calculate the current bucket timestamp (aligned to timeframe)
      const currentBucket = Math.floor(now / timeframeMs) * timeframeMs;
      
      // Get temperature data for this timeframe bucket
      const temperatures = await this.getTemperaturesForBucket(city, currentBucket, timeframeMs);
      console.log(`📊 Found ${temperatures.length} temperature readings for ${city} in bucket ${new Date(currentBucket).toISOString()}`);
      
      if (temperatures.length === 0) {
        return; // No data to aggregate
      }

      // Create candlestick from temperature data
      const candlestick = Candlestick.fromTemperatureData(
        city,
        timeframe,
        currentBucket,
        temperatures
      );

      // Upsert to the specific timeframe table
      await this.candlestickService.upsertCandlestick(timeframe, candlestick);
      
    } catch (error) {
      console.error(`❌ Error flushing ${timeframe} candlestick for ${city}:`, error);
    }
  }

  private getTimeframeMs(timeframe: '15m' | '30m' | '1h'): number {
    switch (timeframe) {
      case '15m': return 15 * 60 * 1000;
      case '30m': return 30 * 60 * 1000;
      case '1h': return 60 * 60 * 1000;
      default: throw new Error(`Unknown timeframe: ${timeframe}`);
    }
  }

  private async getTemperaturesForBucket(
    city: string, 
    bucketStart: number, 
    bucketDuration: number,
  ): Promise<number[]> {
    const bucketEnd = bucketStart + bucketDuration;
    
    try {
      // Get all temperature readings from Redis for this city
      const allData = await this.redisBuffer.getTemperatureDataForCity(city);
      
      // Filter data for this specific time bucket
      const bucketData = allData.filter((item: TemperatureData) => {
        const timestamp = item.timestamp.getTime();
        return timestamp >= bucketStart && timestamp < bucketEnd;
      });

      const temperatures = bucketData.map((item: TemperatureData) => item.temperature);
      
      if (temperatures.length > 0) {
        console.log(`📊 Found ${temperatures.length} temperature readings for ${city} in bucket ${new Date(bucketStart).toISOString()}`);
      }
      
      return temperatures;
    } catch (error) {
      console.error(`❌ Error getting temperatures for ${city}:`, error);
      return [];
    }
  }

  // Method to get aggregation statistics
  async getAggregationStats(): Promise<any> {
    try {
      const stats = await this.candlestickService.getTableStats();
      return {
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error getting aggregation stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async gracefulShutdown(): Promise<void> {
    console.log('🛑 Shutting down aggregation service...');
    
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    // Final flush before shutdown
    try {
      await this.flushAllTimeframes();
      console.log('✅ Final flush completed');
    } catch (error) {
      console.error('❌ Error during final flush:', error);
    }
  }
}