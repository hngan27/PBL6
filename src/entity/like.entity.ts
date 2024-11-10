import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity()
export class Like {
  @PrimaryGeneratedColumn('uuid')
  like_id: string;

  @ManyToOne(() => Post, post => post.likes)
  post: Post;

  @ManyToOne(() => User, user => user.likes)
  user: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
