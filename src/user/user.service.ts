import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAuth0UserDto } from 'src/auth0/auth0-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async createOrUpdateUserFromAuth0(
    userRequest: CreateAuth0UserDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: [
        {
          auth0_id: userRequest.user_id,
        },
        {
          email: userRequest.email,
        },
      ],
    });

    const name = userRequest.name ?? userRequest.email;

    if (user) {
      return await this.userRepository.save({
        ...user,
        name: name,
        email_verified: userRequest.email_verified,
        avatar: userRequest.picture,
      });
    }

    return await this.userRepository.save({
      email: userRequest.email,
      name: name,
      auth0_id: userRequest.user_id,
      email_verified: userRequest.email_verified,
      avatar: userRequest.picture,
    });
  }

  async updateLastLogin(user_id: string, last_login_at: Date): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        auth0_id: user_id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.userRepository.save({
      ...user,
      last_login_at: last_login_at,
    });
  }
}
