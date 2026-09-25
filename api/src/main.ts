import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common/pipes/index.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const PORT = process.env.PORT ?? 3000;

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  await app.listen(PORT);

  return PORT;
}

await bootstrap().then((PORT) =>
  console.info(`🔥 Server running in http://localhost:${PORT}`),
);
