// import { AppDataSource } from '../infrastructure/db/database';
import { Candlestick15mEntity } from '../domain/candlestick/entities/Candlestick15m.entity';
import { Candlestick30mEntity } from '../domain/candlestick/entities/Candlestick30m.entity';
import { Candlestick1hEntity } from '../domain/candlestick/entities/Candlestick1h.entity';
import { Candlestick } from '../domain/candlestick/Candlestick.model';
import { DataSource, Repository } from 'typeorm';
import { injectable, inject } from 'inversify';
import { TYPES } from '../infrastructure/ioc/types';

@injectable()
export class CandlestickService {
  private repo15m: Repository<Candlestick15mEntity>;
  private repo30m: Repository<Candlestick30mEntity>;
  private repo1h: Repository<Candlestick1hEntity>;

  constructor(
    @inject(TYPES.AppDataSource) private dataSource: DataSource
  ) {
    this.repo15m = this.dataSource.getRepository(Candlestick15mEntity);
    this.repo30m = this.dataSource.getRepository(Candlestick30mEntity);
    this.repo1h = this.dataSource.getRepository(Candlestick1hEntity);
  }

  private getRepository(timeframe: '15m' | '30m' | '1h') {
    switch (timeframe) {
      case '15m': return this.repo15m;
      case '30m': return this.repo30m;
      case '1h': return this.repo1h;
      default: throw new Error(`Unknown timeframe: ${timeframe}`);
    }
  }

  async upsertCandlestick(
    timeframe: '15m' | '30m' | '1h',
    candlestick: Candlestick
  ): Promise<void> {
    try {
      const repository = this.getRepository(timeframe);
      
      // Try to find existing candlestick
      const existing = await repository.findOne({
        where: {
          city: candlestick.city,
          timestamp: candlestick.timestamp.toString(),
        } as any,
      });

      if (existing) {
        // Update existing candlestick
        existing.high = Math.max(Number(existing.high), candlestick.high);
        existing.low = Math.min(Number(existing.low), candlestick.low);
        existing.close = candlestick.close;
        existing.volume = (existing.volume || 0) + candlestick.volume;
        
        await repository.save(existing);
        console.log(`📊 Updated ${timeframe} candlestick for ${candlestick.city} at ${new Date(candlestick.timestamp).toISOString()}`);
      } else {
        // Create new candlestick
        const entity = repository.create({
          city: candlestick.city,
          timestamp: candlestick.timestamp.toString(),
          open: candlestick.open,
          high: candlestick.high,
          low: candlestick.low,
          close: candlestick.close,
          volume: candlestick.volume,
        } as any);
        
        await repository.save(entity);
        console.log(`📊 Created ${timeframe} candlestick for ${candlestick.city} at ${new Date(candlestick.timestamp).toISOString()}`);
      }
    } catch (error) {
      console.error(`Error upserting ${timeframe} candlestick:`, error);
      throw error;
    }
  }

  async getCandlesticks(
    timeframe: '15m' | '30m' | '1h',
    city: string,
    fromTimestamp: number,
    toTimestamp: number,
    limit: number = 100
  ): Promise<any[]> {
    try {
      const repository = this.getRepository(timeframe);
      
      const queryBuilder = repository.createQueryBuilder('candlestick')
        .where('candlestick.city = :city', { city })
        .andWhere('candlestick.timestamp >= :from', { from: fromTimestamp.toString() })
        .andWhere('candlestick.timestamp <= :to', { to: toTimestamp.toString() })
        .orderBy('candlestick.timestamp', 'ASC')
        .limit(limit);

      const results = await queryBuilder.getMany();
      
      return results.map(candle => ({
        id: candle.id,
        city: candle.city,
        timeframe,
        timestamp: parseInt(candle.timestamp.toString()),
        open: Number(candle.open),
        high: Number(candle.high),
        low: Number(candle.low),
        close: Number(candle.close),
        volume: candle.volume || 1,
        created_at: candle.created_at,
      }));
    } catch (error) {
      console.error(`Error fetching ${timeframe} candlesticks:`, error);
      throw error;
    }
  }

  async getLatestCandlestick(
    timeframe: '15m' | '30m' | '1h',
    city: string
  ): Promise<any | null> {
    try {
      const repository = this.getRepository(timeframe);
      
      const result = await repository.findOne({
        where: { city } as any,
        order: { timestamp: 'DESC' },
      });

      if (!result) return null;

      return {
        id: result.id,
        city: result.city,
        timeframe,
        timestamp: parseInt(result.timestamp.toString()),
        open: Number(result.open),
        high: Number(result.high),
        low: Number(result.low),
        close: Number(result.close),
        volume: result.volume || 1,
        created_at: result.created_at,
      };
    } catch (error) {
      console.error(`Error fetching latest ${timeframe} candlestick:`, error);
      throw error;
    }
  }

  async getAllCities(): Promise<string[]> {
    try {
      const result = await this.repo1h
        .createQueryBuilder('candlestick')
        .select('DISTINCT candlestick.city', 'city')
        .getRawMany();
      
      return result.map(row => row.city);
    } catch (error) {
      console.error('Error fetching cities:', error);
      throw error;
    }
  }

  async getTableStats(): Promise<{
    timeframe: string;
    totalRecords: number;
    cities: string[];
    oldestRecord: Date | null;
    newestRecord: Date | null;
  }[]> {
    const stats = [];
    
    for (const timeframe of ['15m', '30m', '1h'] as const) {
      try {
        const repository = this.getRepository(timeframe);
        
        const totalRecords = await repository.count();
        
        const cities = await repository
          .createQueryBuilder('candlestick')
          .select('DISTINCT candlestick.city', 'city')
          .getRawMany();
        
        const oldest = await repository.findOne({
          order: { timestamp: 'ASC' }
        });
        
        const newest = await repository.findOne({
          order: { timestamp: 'DESC' }
        });

        stats.push({
          timeframe,
          totalRecords,
          cities: cities.map(c => c.city),
          oldestRecord: oldest ? new Date(parseInt(oldest.timestamp.toString())) : null,
          newestRecord: newest ? new Date(parseInt(newest.timestamp.toString())) : null,
        });
      } catch (error) {
        console.error(`Error getting stats for ${timeframe}:`, error);
        stats.push({
          timeframe,
          totalRecords: 0,
          cities: [],
          oldestRecord: null,
          newestRecord: null,
        });
      }
    }
    
    return stats;
  }
}
