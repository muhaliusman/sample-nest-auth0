import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt-strategy';
import { Auth0Service } from './auth0.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { Auth0Controller } from './auth0.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        baseURL: config.get('auth0.issuer'),
      }),
    }),
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<any> => ({
        store: redisStore,
        host: configService.get<string>('redis.host'),
        port: configService.get<number>('redis.port'),
      }),
    }),
    UserModule,
  ],
  exports: [PassportModule],
  providers: [JwtStrategy, Auth0Service],
  controllers: [Auth0Controller],
})
export class Auth0Module {}
