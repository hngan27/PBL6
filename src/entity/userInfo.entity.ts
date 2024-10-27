// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   OneToOne,
//   JoinColumn,
// } from 'typeorm';
// import { User } from './user.entity';

// @Entity()
// export class UserInfo {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @OneToOne(() => User, user => user.userInfo)
//   @JoinColumn()
//   user: User;

//   @Column({ default: true })
//   is_active: boolean;

//   @Column({ length: 1023, nullable: true })
//   favorites: string;

//   @Column({ length: 1023, nullable: true })
//   other_info: string;

//   @Column({ length: 1023, nullable: true })
//   bio: string;

//   @Column({ type: 'date', nullable: true })
//   date_of_birth: Date;

//   @Column({ length: 1023, nullable: true })
//   address: string;
// }
