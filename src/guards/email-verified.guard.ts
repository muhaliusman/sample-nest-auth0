import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Auth0AccessTokenDecoded } from 'auth0/auth0.type';
import { UserService } from 'user/user.service';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> | never {
    const request = context.switchToHttp().getRequest();
    const user = request.user as Auth0AccessTokenDecoded;

    if (user) {
      const userData = await this.userService.getUserByAuth0Id(user.sub);
      if (userData.email_verified) {
        return true;
      }
    }

    throw new ForbiddenException({
      statusCode: 403,
      error: 'Forbidden',
      message: 'Email not verified',
      type: 'EmailNotVerified',
    });
  }
}
