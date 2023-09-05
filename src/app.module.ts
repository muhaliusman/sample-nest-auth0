import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { Auth0Module } from './auth0/auth0.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import auth0Config from './config/auth0.config';
import typeormConfig from './config/typeorm.config';
import appConfig from './config/app.config';

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
  ],
  providers: [AppService],
})
export class AppModule {}
