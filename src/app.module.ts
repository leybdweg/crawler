import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {WebsiteCrawlerService} from "./services/websiteCrawlerService";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [WebsiteCrawlerService],
})
export class AppModule {}
