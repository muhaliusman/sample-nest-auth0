import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Auth0Module } from './auth0/auth0.module';
import { ConfigModule } from '@nestjs/config';
import auth0Config from './config/auth0.config';
import appConfig from './config/app.config';

@Module({
  imports: [
    Auth0Module,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [auth0Config, appConfig],
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
