import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { Auth0Module } from './auth0/auth0.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import auth0Config from './config/auth0.config';
import typeormConfig from './config/typeorm.config';
import appConfig from './config/app.config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    Auth0Module,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [auth0Config, typeormConfig, appConfig],
    }),
    UserModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => config.get('typeorm'),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        isGlobal: true,
        store: (): any =>
          redisStore({
            socket: {
              host: configService.get<string>('redis.host'),
              port: configService.get<number>('redis.port'),
            },
          }),
      }),
    }),
  ],
  providers: [AppService],
})
export class AppModule {}
