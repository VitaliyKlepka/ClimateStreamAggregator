import { inject } from "inversify";
import { TYPES } from "../../infrastructure/ioc/types";
import { CandlestickService } from "../../application/Candlestick.service";
import { injectable } from "inversify";
import { WithGuard } from "../../infrastructure/httpServer";
import { HttpAuthGuard } from "../auth/guards/http.guard";

@injectable()
export class CandlesticksHandler {

  constructor(
    @inject(TYPES.CandlestickService) private readonly candlestickService: CandlestickService,
  ) {
    console.log("✅ CandlesticksHandler initialized");
  }

  public async getCandlesticks(request: any, reply: any) {
    const { city, timeframe = '1h', from, to, limit = 100 } = request.query as {
      city: string;
      timeframe: '15m' | '30m' | '1h';
      from?: number;
      to?: number;
      limit: number;
    };

    // Default time range: last 24 hours
    const now = Date.now();
    const fromTimestamp = from || (now - 24 * 60 * 60 * 1000);
    const toTimestamp = to || now;

    const candlesticks = await this.candlestickService.getCandlesticks(
      timeframe,
      city,
      fromTimestamp,
      toTimestamp,
      limit
    );

    return {
      success: true,
      data: candlesticks.map((candle: Record<string, any>) => ({
        id: candle.id,
        city: candle.city,
        timeframe: candle.timeframe,
        timestamp: parseInt(candle.timestamp.toString()),
        open: Number(candle.open),
        high: Number(candle.high),
        low: Number(candle.low),
        close: Number(candle.close),
        volume: candle.volume || 1,
        created_at: candle.created_at,
      })),
      meta: {
        count: candlesticks.length,
        timeframe,
        from: fromTimestamp,
        to: toTimestamp,
      }
    };
  }

  public async getAvailableCities(request: any, reply: any) {
    const data = await this.candlestickService.getAllCities();
    return { data };
  }
  
  public async getCandlesticksByDateRange(request: any, reply: any) {
    const { city, from, to } = request.query as any;
    if (!city || !from || !to) {
      return reply.status(400).send({ error: 'Missing query params' });
    }
    const fromDate = new Date(from);
    const toDate = new Date(to);
    // const data = await this.candlestickService.getCandlesticksByDateRange(city, fromDate, toDate);
    return {  };
  }

  public exportMetadata(): Record<string, any>[] {
    return [
      { method: 'GET', path: '/api/candlesticks', handler: WithGuard(HttpAuthGuard, this.getCandlesticks.bind(this)) },
      { method: 'GET', path: '/api/candlesticks/available-cities', handler: WithGuard(HttpAuthGuard, this.getAvailableCities.bind(this)) },
      { method: 'GET', path: '/api/candlesticks/date-range', handler: WithGuard(HttpAuthGuard, this.getCandlesticksByDateRange.bind(this)) },
    ];
  }
}
  