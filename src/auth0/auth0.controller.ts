import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import { CreateAuth0UserDto, UpdateLastLoginDto } from './auth0-user.dto';
import { ResponseHelper } from 'src/helpers/response.helper';
import {
  ApiBearerAuth,
  ApiHeaders,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/user/user.entity';

@Controller('auth0')
@ApiTags('auth0')
@ApiBearerAuth('JWT-auth0')
@ApiHeaders([
  {
    name: 'Authorization',
    description: 'Bearer token',
  },
  {
    name: 'Content-Type',
    description: 'application/json',
  },
])
export class Auth0Controller {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiResponse({
    status: 200,
    description: 'User last login updated',
    type: User,
  })
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async register(@Body() requests: CreateAuth0UserDto) {
    try {
      const user = await this.userService.createOrUpdateUserFromAuth0(requests);

      return user;
    } catch (error) {
      ResponseHelper.throwHttpException(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('last-login')
  @ApiResponse({
    status: 200,
    description: 'User last login updated',
    type: User,
  })
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async updateLastLogin(@Body() requests: UpdateLastLoginDto) {
    try {
      const user = await this.userService.updateLastLogin(
        requests.user_id,
        new Date(),
      );

      return user;
    } catch (error) {
      ResponseHelper.throwHttpException(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
