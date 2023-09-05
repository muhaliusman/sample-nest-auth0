import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAuth0UserDto } from 'src/auth0/create-auth0-user.dto';

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
}
