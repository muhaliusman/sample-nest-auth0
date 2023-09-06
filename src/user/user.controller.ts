import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import {
  CreateAuth0UserDto,
  UpdateLastLoginDto,
  UpdateUserNameDto,
} from './user.dto';
import { User } from './user.entity';
import {
  ApiBearerAuth,
  ApiHeaders,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseHelper } from 'src/helpers/response.helper';
import { Request } from 'express';
import { Auth0AccessTokenDecoded } from 'src/auth0/auth0.type';
import { Auth0Service } from 'src/auth0/auth0.service';

@Controller('users')
@ApiTags('Users')
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
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly auth0Service: Auth0Service,
  ) {}

  @Put(':id/update-name')
  @ApiResponse({
    status: 200,
    description: 'User name updated',
    type: User,
  })
  @UseGuards(AuthGuard('jwt'))
  async updateName(
    @Param('id') id: string,
    @Body() request: UpdateUserNameDto,
  ): Promise<User> {
    return this.userService.updateName(id, request.name);
  }

  @Post('sync-register')
  @ApiResponse({
    status: 200,
    description: 'User registered from auth0',
    type: User,
  })
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async register(@Body() request: CreateAuth0UserDto): Promise<User> {
    try {
      const user = await this.userService.createOrUpdateUserFromAuth0(
        request.user_id,
        {
          name: request.name,
          email_verified: request.email_verified,
          picture: request.picture,
        },
        request.email,
      );

      return user;
    } catch (error) {
      ResponseHelper.throwHttpException(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('sync-last-login')
  @ApiResponse({
    status: 200,
    description: 'User last login updated',
    type: User,
  })
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async updateLastLogin(@Body() requests: UpdateLastLoginDto): Promise<User> {
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

  @Get('my-profile')
  @ApiResponse({
    status: 200,
    description: 'Get user profile from access token',
    type: User,
  })
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async getUserFromAccessToken(@Req() request: Request): Promise<User> {
    try {
      const tokenDecoded = request.user as Auth0AccessTokenDecoded;
      const auth0User = await this.auth0Service.getAuth0User(tokenDecoded.sub);

      // update local database
      const user = await this.userService.createOrUpdateUserFromAuth0(
        auth0User.user_id,
        {
          name: auth0User.name,
          email_verified: auth0User.email_verified,
          picture: auth0User.picture,
        },
        auth0User.email,
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
