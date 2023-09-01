import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  avatar: string;

  @Column()
  last_login_at: Date;

  @Column()
  email_verified: boolean;

  @Column()
  last_session_active_at: Date;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;

  constructor(name: string, email: string, avatar: string) {
    this.name = name;
    this.email = email;
    this.avatar = avatar;
  }
}
