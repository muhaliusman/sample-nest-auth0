import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetTokenResponse } from './auth0.type';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class Auth0Service {
  protected readonly logger = new Logger(Auth0Service.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getAccessToken(): Promise<string> {
    try {
      const clientId = this.configService.get<string>('auth0.clientId');
      const clientSecret = this.configService.get<string>('auth0.clientSecret');
      const audience = this.configService.get<string>('auth0.audience');
      const url = `oauth/token`;

      const value = await this.cacheManager.get('key');
      console.log(value);

      const observer = this.httpService
        .post<GetTokenResponse>(
          url,
          {
            client_id: clientId,
            client_secret: clientSecret,
            audience: audience,
            grant_type: 'client_credentials',
          },
          {
            baseURL: this.configService.get<string>('auth0.issuer'),
          },
        )
        .pipe(
          catchError((e: AxiosError) => {
            throw e;
          }),
        );

      const response = await firstValueFrom(observer);

      return response.data.access_token;
    } catch (error) {
      this.logger.error(
        `Error getting access token: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }
}
