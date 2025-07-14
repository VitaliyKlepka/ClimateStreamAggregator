import { Index, MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class TimeframeCandlesticks1752431389450 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      // Create 15-minute candlesticks table
      await queryRunner.createTable(
        new Table({
          name: 'candlesticks_15m',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'city',
              type: 'varchar',
              length: '50',
            },
            {
              name: 'timestamp',
              type: 'bigint',
            },
            {
              name: 'open',
              type: 'decimal',
              precision: 10,
              scale: 2,
            },
            {
              name: 'high',
              type: 'decimal',
              precision: 10,
              scale: 2,
            },
            {
              name: 'low',
              type: 'decimal',
              precision: 10,
              scale: 2,
            },
            {
              name: 'close',
              type: 'decimal',
              precision: 10,
              scale: 2,
            },
            {
              name: 'volume',
              type: 'int',
              default: 1,
            },
            {
              name: 'created_at',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updated_at',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
              onUpdate: 'CURRENT_TIMESTAMP',
            },
          ],
        }),
        true
      );

      // Create 30-minute candlesticks table
      await queryRunner.createTable(
        new Table({
          name: 'candlesticks_30m',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'city',
              type: 'varchar',
              length: '50',
            },
            {
              name: 'timestamp',
              type: 'bigint',
            },
            {
              name: 'open',
              type: 'decimal',
              precision: 10,
              scale: 2,
            },
            {
              name: 'high',
              type: 'decimal',
              precision: 10,
              scale: 2,
            },
            {
              name: 'low',
              type: 'decimal',
              precision: 10,
              scale: 2,
            },
            {
              name: 'close',
              type: 'decimal',
              precision: 10,
              scale: 2,
            },
            {
              name: 'volume',
              type: 'int',
              default: 1,
            },
            {
              name: 'created_at',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updated_at',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
              onUpdate: 'CURRENT_TIMESTAMP',
            },
          ],
        }),
        true
      );

      // Create 1-hour candlesticks table
      await queryRunner.createTable(
        new Table({
          name: 'candlesticks_1h',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'city',
              type: 'varchar',
              length: '50',
            },
            {
              name: 'timestamp',
              type: 'bigint',
            },
            {
              name: 'open',
              type: 'decimal',
              precision: 10,
              scale: 2,
            },
            {
              name: 'high',
              type: 'decimal',
              precision: 10,
              scale: 2,
            },
            {
              name: 'low',
              type: 'decimal',
              precision: 10,
              scale: 2,
            },
            {
              name: 'close',
              type: 'decimal',
              precision: 10,
              scale: 2,
            },
            {
              name: 'volume',
              type: 'int',
              default: 1,
            },
            {
              name: 'created_at',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updated_at',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
              onUpdate: 'CURRENT_TIMESTAMP',
            },
          ],
        }),
        true
      );

      // Create indexes for 15m table
      await queryRunner.createIndex(
        'candlesticks_15m',
        new TableIndex({
          name: 'IDX_candlesticks_15m_city_timestamp',
          columnNames: ['city', 'timestamp'],
          isUnique: true,
        })
      );
      await queryRunner.createIndex(
        'candlesticks_15m',
        new TableIndex({
          name: 'IDX_candlesticks_15m_city',
          columnNames: ['city'],
        })
      );
      await queryRunner.createIndex(
        'candlesticks_15m',
        new TableIndex({
          name: 'IDX_candlesticks_15m_timestamp',
          columnNames: ['timestamp'],
        })
      );

      // Create indexes for 30m table
      await queryRunner.createIndex(
        'candlesticks_30m',
        new TableIndex({
          name: 'IDX_candlesticks_30m_city_timestamp',
          columnNames: ['city', 'timestamp'],
          isUnique: true,
        })
      );
      await queryRunner.createIndex(
        'candlesticks_30m',
        new TableIndex({
          name: 'IDX_candlesticks_30m_city',
          columnNames: ['city'],
        })
      );
      await queryRunner.createIndex(
        'candlesticks_30m',
        new TableIndex({
          name: 'IDX_candlesticks_30m_timestamp',
          columnNames: ['timestamp'],
        })
      );

      // Create indexes for 1h table
      await queryRunner.createIndex(
        'candlesticks_1h',
        new TableIndex({
          name: 'IDX_candlesticks_1h_city_timestamp',
          columnNames: ['city', 'timestamp'],
          isUnique: true,
        })
      );
      await queryRunner.createIndex(
        'candlesticks_1h',
        new TableIndex({
          name: 'IDX_candlesticks_1h_city',
          columnNames: ['city'],
        })
      );
      await queryRunner.createIndex(
        'candlesticks_1h',
        new TableIndex({
          name: 'IDX_candlesticks_1h_timestamp',
          columnNames: ['timestamp'],
        })
      );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropIndex('candlesticks_15m', 'IDX_candlesticks_15m_city_timestamp');
      await queryRunner.dropIndex('candlesticks_15m', 'IDX_candlesticks_15m_city');
      await queryRunner.dropIndex('candlesticks_15m', 'IDX_candlesticks_15m_timestamp');
      await queryRunner.dropTable('candlesticks_15m');

      await queryRunner.dropIndex('candlesticks_30m', 'IDX_candlesticks_30m_city_timestamp');
      await queryRunner.dropIndex('candlesticks_30m', 'IDX_candlesticks_30m_city');
      await queryRunner.dropIndex('candlesticks_30m', 'IDX_candlesticks_30m_timestamp');
      await queryRunner.dropTable('candlesticks_30m');

      await queryRunner.dropIndex('candlesticks_1h', 'IDX_candlesticks_1h_city_timestamp');
      await queryRunner.dropIndex('candlesticks_1h', 'IDX_candlesticks_1h_city');
      await queryRunner.dropIndex('candlesticks_1h', 'IDX_candlesticks_1h_timestamp');
      await queryRunner.dropTable('candlesticks_1h');
    }

}
