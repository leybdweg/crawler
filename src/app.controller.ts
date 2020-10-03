import {Controller, Get, Post, Req, Res} from '@nestjs/common';
import { Request, Response } from 'express';
import {WebsiteCrawlerService} from "./services/websiteCrawlerService";

@Controller()
export class AppController {
  constructor(
      private readonly websiteCrawler: WebsiteCrawlerService
  ) {}

  @Get('api/crawler')
  async getCrawler(@Req() req: Request, @Res() res: Response) {
    res.json({lalala: await this.websiteCrawler.getHello()})
  }

  // @Post('api/crawler')
  // createCrawler(@Req() req: Request, @Res() res: Response) {
  //   res.json({lalala: this.websiteCrawler.getHello()})
  // }
}
