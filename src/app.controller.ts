import {Body, Controller, Get, Post, Req, Res} from '@nestjs/common';
import {Request, Response} from 'express';
import {Website, WebsiteService, WebsiteStatus} from "./services/website.service";
import {WebsiteContentService} from "./services/website-content.service";

@Controller()
export class AppController {
  private readonly websiteContentService: WebsiteContentService;
  private readonly websiteService: WebsiteService;

  constructor(
      websiteContentService: WebsiteContentService,
      websiteService: WebsiteService,
  ) {
    this.websiteContentService = websiteContentService;
    this.websiteService = websiteService;
}

  @Get('ui/crawler')
  async getCrawler(@Req() req: Request, @Res() res: Response) {
    res.sendFile('index.html', {
      root: `${__dirname}/../public`
    });
  }

  @Get('api/websites')
  async getWebsites(@Req() req: Request, @Res() res: Response) {
    const websites = this.websiteContentService.getContents();
    const endpointResponse = websites.map(website => {
      return {
        title: website.title,
        url: website.url,
        links: website.anchorsLinks
      }
    });

    res.json(endpointResponse)
  }

  @Post('api/websites')
  async createWebsite(
      @Req() req: Request,
      @Res() res: Response,
      @Body() body: any
  ):Promise<void> {
    // TODO: add validation to verify came as it expected/ return error if not

    await this.websiteService.createWebsite({
      createdAt: new Date(),
      lastUpdateAt: new Date(),
      maxDepth: body.maxDepth,
      maxPages: body.maxPages,
      nextDepth: 1,
      remainingPages: body.maxPages,
      status: WebsiteStatus.pending,
      url: body.url
    }); // TODO: add tryCatch and failure response

    res.status(201);
    res.send('Created website')
  }

  // validateWebsiteRequest(body: any) {
  //   const
  //   if(body.)
  // }
}

