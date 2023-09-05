import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const configService = app.get(ConfigService);

  const openAiConfig = new DocumentBuilder()
    .setTitle('Nest auth0 sample')
    .setDescription('Sample NestJS app with auth0')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth0',
    )
    .build();
  const document = SwaggerModule.createDocument(app, openAiConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(configService.get('app.port'));
}
bootstrap();
