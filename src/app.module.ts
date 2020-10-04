import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {WebsiteCrawlerManager} from "./services/website-crawler.manager";
import {WebsiteService} from "./services/website.service";
import {PageService} from "./services/page.service";
import {PageContentService} from "./services/page-content.service";
import {ScheduleModule} from "@nestjs/schedule";

@Module({
  imports: [
      ScheduleModule.forRoot()
  ],
  controllers: [
      AppController
  ],
  providers: [
      WebsiteCrawlerManager,
      WebsiteService,
      PageService,
      PageContentService
  ],
})
export class AppModule {}
