import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt-strategy';
import { Auth0Service } from './auth0.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        baseURL: config.get('auth0.issuer'),
      }),
    }),
  ],
  exports: [PassportModule, Auth0Service],
  providers: [JwtStrategy, Auth0Service],
})
export class Auth0Module {}
