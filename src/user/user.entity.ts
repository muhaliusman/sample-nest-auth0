import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  auth0_id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column('varchar', { nullable: true, default: null })
  avatar: string;

  @Column('datetime', { nullable: true, default: null })
  last_login_at: Date;

  @Column()
  email_verified: boolean;

  @Column('datetime', { nullable: true, default: null })
  last_session_active_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
