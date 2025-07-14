import dotenv from 'dotenv';

dotenv.config();

export const config = {
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'climate_aggregator',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  websocket: {
    url: process.env.WS_URL || 'ws://localhost:8765',
  },
  httpServer: {
    port: parseInt(process.env.PORT || '3000'),
    host: '0.0.0.0',
  },
  nodeEnv: process.env.NODE_ENV || 'development',
};