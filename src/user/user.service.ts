import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth0User } from 'src/auth0/auth0.type';
import { Auth0Service } from 'src/auth0/auth0.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly auth0Service: Auth0Service,
  ) {}

  async getUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async createOrUpdateUserFromAuth0(
    auth0UserId: string,
    auth0User: Partial<Auth0User> & { last_login_at?: Date },
    email?: string,
  ): Promise<User> {
    const conditions: { [key: string]: string }[] = [
      {
        auth0_id: auth0UserId,
      },
    ];

    if (email) {
      conditions.push({
        email: email,
      });
    }

    const user = await this.userRepository.findOne({
      where: conditions,
    });

    const name = auth0User.name ?? email;

    if (user) {
      return await this.userRepository.save({
        ...user,
        name: name,
        email_verified: auth0User.email_verified,
        avatar: auth0User.picture ?? user.avatar,
        last_login_at: auth0User.last_login_at ?? user.last_login_at,
      });
    }

    return await this.userRepository.save({
      email: email,
      name: name,
      auth0_id: auth0UserId,
      email_verified: auth0User.email_verified,
      avatar: auth0User.picture,
      last_login_at: auth0User.last_login_at,
    });
  }

  async updateName(userId: string, name: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.auth0Service.updateUser(user.auth0_id, { name });

    return await this.userRepository.save({
      ...user,
      name: name,
    });
  }
}
