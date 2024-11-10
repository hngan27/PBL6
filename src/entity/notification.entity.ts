import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  notification_id: string;

  @ManyToOne(() => User, user => user.notifications)
  user: User;

  @Column({
    type: 'enum',
    enum: ['like', 'comment', 'friend_request', 'message'],
  })
  type: 'like' | 'comment' | 'friend_request' | 'message';

  @Column({ type: 'uuid' })
  reference_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ default: false })
  is_read: boolean;
}
