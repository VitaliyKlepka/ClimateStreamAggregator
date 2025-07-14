import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('candlesticks_30m')
@Index(['city', 'timestamp'], { unique: true })
@Index(['city'])
@Index(['timestamp'])
export class Candlestick30mEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  city!: string;

  @Column({ type: 'bigint' })
  timestamp!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  open!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  high!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  low!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  close!: number;

  @Column({ type: 'int', default: 1 })
  volume!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}