import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {WebsiteCrawlerManager} from "./services/website-crawler.manager";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [WebsiteCrawlerManager],
})
export class AppModule {}
