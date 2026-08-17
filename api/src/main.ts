import "reflect-metadata";
import fastifyCookie from "@fastify/cookie";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { WsAdapter } from "@nestjs/platform-ws";

import { AppModule } from "@/app.module.js";

import type { AppConfig } from "@/config/config.js";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  await app.register(fastifyCookie);

  app.useWebSocketAdapter(new WsAdapter(app.getHttpServer()));

  const configService = app.get(ConfigService);
  const { port, webUrl } = configService.getOrThrow<AppConfig["app"]>("app");

  app.enableCors({ origin: webUrl, credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  await app.listen(port, "0.0.0.0");
}

void bootstrap();
