import {Body, Controller, Get, Post, Req, Res} from '@nestjs/common';
import { Request, Response } from 'express';
import {WebsiteCrawlerManager} from "./services/website-crawler.manager";
import {Website, WebsiteService} from "./services/website.service";

@Controller()
export class AppController {
  private readonly websiteCrawler: WebsiteCrawlerManager;
  private readonly websiteService: WebsiteService;

  constructor(
      websiteCrawler: WebsiteCrawlerManager,
      websiteService: WebsiteService,
  ) {
    this.websiteCrawler = websiteCrawler;
    this.websiteService = websiteService;
}

  @Get('ui/crawler')
  async getCrawler(@Req() req: Request, @Res() res: Response) {
    // res.render('index');
    res.sendFile('index.html', {
      root: `${__dirname}/../public`
    });
  }

  @Post('api/crawler')
  async createCrawler(
      @Req() req: Request,
      @Res() res: Response,
      @Body() body: any
  ):Promise<void> {
    const newWebsite = body as Website; // TODO: add validation to verify came as it expected/ return error if not

    await this.websiteService.createWebsite(newWebsite); // TODO: add tryCatch and failure response

    res.status(201);
    res.send('Created website')
  }

  // validateWebsiteRequest(body: any) {
  //   const
  //   if(body.)
  // }
}

