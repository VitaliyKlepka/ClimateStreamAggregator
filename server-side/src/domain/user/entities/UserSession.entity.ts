import { Entity, Index, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('user_sessions')
@Index(['user_id'], { unique: false })
export class UserSessionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', nullable: false })
  user_id!: number;

  @Column({ type: 'text', nullable: false })
  payload!: string;

  @Column({ type: 'timestamp', nullable: false })
  expires_at!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}