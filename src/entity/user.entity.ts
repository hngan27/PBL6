import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserInfo } from './userInfo.entity';
import { Post } from './post.entity';
import { Friend } from './friend.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';
import { Message } from './message.entity';
import { Notification } from './notification.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ length: 127 })
  full_name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255, nullable: true })
  avatar_url: string;

  @Column({ length: 258, nullable: true })
  interestedUser: string;

  @OneToMany(() => UserInfo, userInfo => userInfo.user)
  userInfo: UserInfo[];

  @OneToMany(() => Post, post => post.user)
  posts: Post[];

  @OneToMany(() => Friend, friend => friend.user)
  friends: Friend[];

  @OneToMany(() => Comment, comment => comment.user)
  comments: Comment[];

  @OneToMany(() => Like, like => like.user)
  likes: Like[];

  @OneToMany(() => Message, message => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, message => message.receiver)
  receivedMessages: Message[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];
}
