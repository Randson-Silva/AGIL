import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const PORT = process.env.PORT ?? 3000;

  const app = await NestFactory.create(AppModule);

  await app.listen(PORT);

  return PORT;
}

await bootstrap().then((PORT) =>
  console.info(`🔥 Server running in http://localhost:${PORT}`),
);
