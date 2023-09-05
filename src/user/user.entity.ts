import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'User id',
  })
  id: string;

  @Column()
  @ApiProperty({
    description: 'Auth0 user id',
  })
  auth0_id: string;

  @Column()
  @ApiProperty({
    description: 'User name',
  })
  name: string;

  @Column()
  @ApiProperty({
    description: 'User email',
  })
  email: string;

  @Column('varchar', { nullable: true, default: null })
  @ApiProperty({
    description: 'User avatar',
  })
  avatar: string;

  @Column('datetime', { nullable: true, default: null })
  @ApiProperty({
    description: 'Last login datetime of user',
  })
  last_login_at: Date;

  @Column()
  @ApiProperty({
    description: 'Email verified status of user',
  })
  email_verified: boolean;

  @Column('datetime', { nullable: true, default: null })
  @ApiProperty({
    description: 'Last session active datetime of user',
  })
  last_session_active_at: Date;

  @CreateDateColumn()
  @ApiProperty({
    description: 'Created user datetime',
  })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: 'Updated user datetime',
  })
  updated_at: Date;
}
