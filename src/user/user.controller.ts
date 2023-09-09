import {
  BadRequestException,
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
import { Auth0UserDto, UpdatePasswordDto, UpdateUserNameDto } from './user.dto';
import { User } from './user.entity';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeaders,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseHelper } from 'src/helpers/response.helper';
import { Request } from 'express';
import { Auth0AccessTokenDecoded } from 'src/auth0/auth0.type';
import { Auth0Service } from 'src/auth0/auth0.service';
import { GeneralSuccessResponse } from 'src/helpers/response.type';
import { EmailVerifiedGuard } from 'src/guards/email-verified.guard';
import { Auth0WhitelistGuard } from 'src/guards/auth0-whitelist.guard';

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
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
  schema: {
    example: {
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Internal server error',
    },
  },
})
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly auth0Service: Auth0Service,
  ) {}

  @Put(':id/update-name')
  @ApiOkResponse({
    description: 'User name updated',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    schema: {
      example: {
        statusCode: 400,
        error: 'Bad Request',
        message: 'You are not allowed to update this user',
      },
    },
  })
  @UseGuards(AuthGuard('jwt'), EmailVerifiedGuard)
  @UsePipes(new ValidationPipe())
  async updateName(
    @Param('id') id: string,
    @Req() expressRequest: Request,
    @Body() request: UpdateUserNameDto,
  ): Promise<User> | never {
    try {
      const localUser = await this.userService.getUserById(id);
      const tokenDecoded = expressRequest.user as Auth0AccessTokenDecoded;
      if (!localUser || localUser.auth0_id !== tokenDecoded.sub) {
        throw new BadRequestException(
          'You are not allowed to update this user',
        );
      }
      return await this.userService.updateName(id, request.name);
    } catch (error) {
      ResponseHelper.throwHttpException(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('sync-auth0')
  @ApiResponse({
    status: 200,
    description: 'Sync user from auth0, only for whitelisted IP (check auth0 ipWhitelist documentation)',
    type: User,
  })
  @UseGuards(AuthGuard('jwt'), Auth0WhitelistGuard)
  @UsePipes(new ValidationPipe())
  async syncAuth0User(@Body() request: Auth0UserDto): Promise<User> | never {
    try {
      const user = await this.userService.createOrUpdateUserFromAuth0(
        request.user_id,
        {
          name: request.name,
          email_verified: request.email_verified,
          picture: request.picture,
          last_login_at: request.last_login_at,
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

  @Get('my-profile')
  @ApiResponse({
    status: 200,
    description: 'Get user profile from access token',
    type: User,
  })
  @UseGuards(AuthGuard('jwt'), EmailVerifiedGuard)
  @UsePipes(new ValidationPipe())
  async getUserFromAccessToken(@Req() request: Request): Promise<User> | never {
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

  @Put(':id/update-password')
  @ApiOkResponse({
    description: `User's password updated`,
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    schema: {
      example: {
        statusCode: 400,
        error: 'Bad Request',
        message: 'You are not allowed to update this user',
      },
    },
  })
  @UseGuards(AuthGuard('jwt'), EmailVerifiedGuard)
  @UsePipes(new ValidationPipe())
  async updatePassword(
    @Param('id') id: string,
    @Req() expressRequest: Request,
    @Body() request: UpdatePasswordDto,
  ): Promise<GeneralSuccessResponse> | never {
    try {
      const localUser = await this.userService.getUserById(id);
      const tokenDecoded = expressRequest.user as Auth0AccessTokenDecoded;
      if (!localUser || localUser.auth0_id !== tokenDecoded.sub) {
        throw new BadRequestException(
          'You are not allowed to update this user',
        );
      }
      await this.userService.updatePassword(id, request.password);
      return ResponseHelper.generalSuccessResponse(`User's password updated`);
    } catch (error) {
      ResponseHelper.throwHttpException(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
