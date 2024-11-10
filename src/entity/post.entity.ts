import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';
import { AccessModifier } from '../enums/accessModifier.enum';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  post_id: string;

  @ManyToOne(() => User, user => user.posts)
  user: User;

  @Column('text')
  content: string;

  @Column({ type: 'enum', enum: AccessModifier })
  access_modifier: AccessModifier;

  @Column({ default: 0 })
  like_count: number;

  @Column({ default: 0 })
  comment_count: number;

  @Column({ type: 'varchar', length: 255, nullable: true }) 
  image_url: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @OneToMany(() => Comment, comment => comment.post)
  comments: Comment[];

  @OneToMany(() => Like, like => like.post)
  likes: Like[];
}
