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

@Controller('auth0')
export class Auth0Controller {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async register(@Body() requests: CreateAuth0UserDto) {
    try {
      const user = await this.userService.createOrUpdateUserFromAuth0(requests);
      return ResponseHelper.generateSuccessResponse(user);
    } catch (error) {
      ResponseHelper.throwHttpException(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('update-last-login')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async updateLastLogin(@Body() requests: UpdateLastLoginDto) {
    try {
      const user = await this.userService.updateLastLogin(
        requests.user_id,
        new Date(),
      );

      return ResponseHelper.generateSuccessResponse(user);
    } catch (error) {
      ResponseHelper.throwHttpException(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
