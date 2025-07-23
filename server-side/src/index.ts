import { initializeDatabase } from './infrastructure/db/database';
import { RedisBuffer } from './infrastructure/redis';
import { WSClient } from './infrastructure/wsClient';
import { createFastifyTransport } from './infrastructure/fastifyTransport';
import { HttpServer } from './infrastructure/httpServer';
import { config } from './config';
import { iocContainer } from './infrastructure/ioc/config';
import { AggregationService } from './application/Aggregation.service';
import { TYPES } from './infrastructure/ioc/types';

async function main() {
  await initializeDatabase();

  const redisBuffer = iocContainer.get<RedisBuffer>(TYPES.RedisBuffer);
  const aggregationService = iocContainer.get<AggregationService>(TYPES.AggregationService);

  // Start WebSocket client
  const wsClient = new WSClient(redisBuffer);
  wsClient.connect();

  // httpTransport layer provider
  const httpTransport = await createFastifyTransport();

  // Start HTTP server
  const httpServer = new HttpServer(config.httpServer, httpTransport, iocContainer);
  httpServer.start();

  aggregationService.startPeriodicFlush(10000); // every 10 seconds

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    await aggregationService.gracefulShutdown();
    await redisBuffer.disconnect();
    await httpServer.stop();
    wsClient.disconnect();

    process.exit(0);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });
}

main();