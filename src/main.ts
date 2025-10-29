import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api/v1");
app.enableCors({
  origin: 'https://espacioboulevardlinares.cl',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Authorization,Content-Type',
});
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      
    })
  );
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
 await app.listen(3000, '0.0.0.0');
}
bootstrap();
