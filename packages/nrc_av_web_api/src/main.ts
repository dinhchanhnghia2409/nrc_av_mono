import { ConfigService } from '@nestjs/config/dist';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger/dist';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Nissan')
    .setDescription('API for Nissan project')
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/explorer', app, document);

  const configService = app.get<ConfigService>(ConfigService);
  app.enableCors({
    origin: true,
    preflightContinue: false,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    optionsSuccessStatus: 204,
  });

  app.startAllMicroservices();
  await app.listen(configService.get<number>('SERVER_PORT'));
}

bootstrap();
