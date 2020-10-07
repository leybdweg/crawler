import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {NestExpressApplication} from "@nestjs/platform-express";

(async function main(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  await app.listen(process.env.APP_PORT || 7700);
} )();
