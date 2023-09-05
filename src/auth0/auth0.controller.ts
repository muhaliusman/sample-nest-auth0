import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import { CreateAuth0UserDto } from './create-auth0-user.dto';

@Controller('auth0')
export class Auth0Controller {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async register(@Body() requests: CreateAuth0UserDto) {
    return this.userService.createOrUpdateUserFromAuth0(requests);
  }
}
