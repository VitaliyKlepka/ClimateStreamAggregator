import { DataSource } from 'typeorm';
import { config } from '../../config';
import { Candlestick15mEntity } from '../../domain/candlestick/entities/Candlestick15m.entity';
import { Candlestick30mEntity } from '../../domain/candlestick/entities/Candlestick30m.entity';
import { Candlestick1hEntity } from '../../domain/candlestick/entities/Candlestick1h.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: config.nodeEnv === 'development', // Auto-create tables in dev
  logging: config.nodeEnv === 'development',
  // entities: [],
  entities: [Candlestick15mEntity, Candlestick30mEntity, Candlestick1hEntity],
  migrations: ['src/infrastructure/db/migrations/*.ts'],
  subscribers: [],
  migrationsRun: false, // Don't auto-run migrations
});

export async function initializeDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
    
    // Check if migrations need to be run
    const pendingMigrations = await AppDataSource.showMigrations();
    if (pendingMigrations) {
      console.log('⚠️  Pending migrations found. Run: npm run migration:run');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function runMigrations(): Promise<void> {
  try {
    await AppDataSource.runMigrations();
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}