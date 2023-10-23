import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth0User } from 'auth0/auth0.type';
import { Auth0Service } from 'auth0/auth0.service';
import { User } from './user.entity';

@Injectable()
export class UserService {
  protected readonly logger = new Logger(Auth0Service.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly auth0Service: Auth0Service,
  ) {}

  async getUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });

    return user;
  }

  async getUserByAuth0Id(auth0Id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        auth0_id: auth0Id,
      },
    });

    return user;
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
        email: email ?? user.email,
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

    try {
      await this.auth0Service.updateUser(user.auth0_id, { name });
    } catch (error) {
      this.logger.log('Error updating user name in Auth0', error);
    }

    return await this.userRepository.save({
      ...user,
      name: name,
    });
  }

  async updatePassword(
    userId: string,
    password: string,
  ): Promise<boolean> | never {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.auth0Service.updatePassword(user.auth0_id, password);
      return true;
    } catch (error) {
      this.logger.log('Error updating user password in Auth0', error);
      throw error;
    }
  }
}
