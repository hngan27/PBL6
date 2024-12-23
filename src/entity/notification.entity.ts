import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn
} from 'typeorm';
import { User } from '../entity/user.entity';
import { Post } from '../entity/post.entity';
import { NotificationType } from '../enums/notifi.enum';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.notificationsReceived)
  receiver: User; // Người nhận thông báo

  @ManyToOne(() => User, user => user.notificationsSent, { nullable: true })
  sender: User; // Người gửi thông báo

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column()
  content: string; // Nội dung thông báo

  @Column({ default: false })
  is_read: boolean; // Trạng thái đã đọc

  @CreateDateColumn()
  created_at: Date; // Ngày tạo thông báo

  @Column({ nullable: true }) 
  post_id: string;

  @ManyToOne(() => Post, { nullable: true })
  @JoinColumn({ name: 'post_id' })
  post: Post;

}
