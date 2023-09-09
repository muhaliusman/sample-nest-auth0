import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Auth0WhitelistGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const auth0Whitelist = this.configService.get<string>('auth0.ipWhitelist');
    const ips = auth0Whitelist.split(',');

    const request = context.switchToHttp().getRequest();
    const clientIp =
      request.headers['x-forwarded-for'] || request.connection.remoteAddress;

    if (ips.includes(clientIp)) {
      return true;
    }

    return false;
  }
}
