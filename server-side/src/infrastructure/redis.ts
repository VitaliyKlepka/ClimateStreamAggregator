import { config } from '../config';
import Redis from 'ioredis';
import { injectable } from 'inversify';

export interface TemperatureData {
  city: string;
  temperature: number;
  timestamp: Date;
}

@injectable()
export class RedisBuffer {
  //@ts-ignore
  private redis: Redis;
  private readonly TEMPERATURE_KEY_PREFIX = 'temp:';
  private readonly BUFFER_EXPIRY = 3600; // 1 hour in seconds

  constructor() {
    this.connect();
  }

  private connect(): void {
    this.redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
    });
  }

  public disconnect(): void {
    this.redis.disconnect();
  }

  // Store temperature reading in Redis buffer
  async storeTemperatureReading(reading: TemperatureData): Promise<void> {
    const key = `${this.TEMPERATURE_KEY_PREFIX}${reading.city}`;
    const data = {
      temperature: reading.temperature,
      timestamp: reading.timestamp.toISOString(),
      city: reading.city
    };

    // Store as sorted set with timestamp as score for easy range queries
    await this.redis.zadd(
      key,
      reading.timestamp.getTime(),
      JSON.stringify(data)
    );

    // Set expiry on the key
    await this.redis.expire(key, this.BUFFER_EXPIRY);
  }

  // Get all temperature data from buffer for aggregation
  async getTemperatureData(): Promise<TemperatureData[]> {
    const cities = await this.getCities();
    const allData: TemperatureData[] = [];

    for (const city of cities) {
      const cityData = await this.getTemperatureDataForCity(city);
      allData.push(...cityData);
    }

    return allData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // Get temperature data for a specific city
  async getTemperatureDataForCity(city: string): Promise<TemperatureData[]> {
    const key = `${this.TEMPERATURE_KEY_PREFIX}${city}`;
    
    // Get all data from sorted set
    const rawData = await this.redis.zrange(key, 0, -1);
    
    return rawData.map((item: string) => {
      const parsed = JSON.parse(item);
      return {
        city: parsed.city,
        temperature: parsed.temperature,
        timestamp: new Date(parsed.timestamp)
      };
    });
  }

  // Get temperature data within a time range
  async getTemperatureDataInRange(
    city: string,
    fromTime: Date,
    toTime: Date
  ): Promise<TemperatureData[]> {
    const key = `${this.TEMPERATURE_KEY_PREFIX}${city}`;
    
    // Use ZRANGEBYSCORE to get data within time range
    const rawData = await this.redis.zrangebyscore(
      key,
      fromTime.getTime(),
      toTime.getTime()
    );
    
    return rawData.map((item: string) => {
      const parsed = JSON.parse(item);
      return {
        city: parsed.city,
        temperature: parsed.temperature,
        timestamp: new Date(parsed.timestamp)
      };
    });
  }

  // Get all cities that have temperature data
  async getCities(): Promise<string[]> {
    const pattern = `${this.TEMPERATURE_KEY_PREFIX}*`;
    const keys = await this.redis.keys(pattern);
    
    return keys.map(key => key.replace(this.TEMPERATURE_KEY_PREFIX, ''));
  }

  // Clear temperature data for a specific city
  async clearCityData(city: string): Promise<void> {
    const key = `${this.TEMPERATURE_KEY_PREFIX}${city}`;
    await this.redis.del(key);
  }

  // Clear old temperature data (older than specified time)
  async clearOldData(olderThan: Date): Promise<void> {
    const cities = await this.getCities();
    
    for (const city of cities) {
      const key = `${this.TEMPERATURE_KEY_PREFIX}${city}`;
      
      // Remove data older than specified time
      await this.redis.zremrangebyscore(
        key,
        0,
        olderThan.getTime()
      );
    }
  }

  // Get buffer statistics
  async getBufferStats(): Promise<{
    totalCities: number;
    totalReadings: number;
    citiesWithData: { city: string; count: number; oldestReading: Date; newestReading: Date }[];
  }> {
    const cities = await this.getCities();
    const citiesWithData = [];
    let totalReadings = 0;

    for (const city of cities) {
      const key = `${this.TEMPERATURE_KEY_PREFIX}${city}`;
      const count = await this.redis.zcard(key);
      
      if (count > 0) {
        totalReadings += count;
        
        // Get oldest and newest readings
        const oldest = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
        const newest = await this.redis.zrange(key, -1, -1, 'WITHSCORES');
        
        citiesWithData.push({
          city,
          count,
          oldestReading: new Date(parseInt(oldest[1])),
          newestReading: new Date(parseInt(newest[1]))
        });
      }
    }

    return {
      totalCities: cities.length,
      totalReadings,
      citiesWithData
    };
  }

  // Health check for Redis connection
  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }
}