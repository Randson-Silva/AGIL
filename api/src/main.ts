import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common/pipes/index.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  Date.prototype.toJSON = function () {
    const timezoneOffset = -3;
    const dataLocal = new Date(this.getTime() + timezoneOffset * 3600 * 1000);
    return dataLocal.toISOString().replace('Z', '-03:00');
  };
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

  await app.listen(PORT, '0.0.0.0');

  return PORT;
}

await bootstrap().then((PORT) =>
  console.info(
    `🔥 Server running in ${process.env.NODE_ENV} at http://localhost:${PORT}`,
  ),
);
