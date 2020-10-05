import {Injectable, OnModuleInit} from '@nestjs/common';
// import {Connection, createConnection} from "mysql2/promise";
import {Connection, createConnection} from "mysql2";
import {Website, WebsiteService, WebsiteStatus} from "./website.service";
import {Cron, CronExpression} from "@nestjs/schedule";
// import * as aa from 'simplecrawler';
import * as Crawler from 'crawler';
import {PageContentService} from "./page-content.service";

// import * as mpromise from "mysql2/promise";

@Injectable()
export class WebsiteCrawlerManager {
    private readonly websiteService: WebsiteService;
    private readonly pageContentService: PageContentService;
    // private links = new Map<number, Website>([]);

    constructor(
        websiteService: WebsiteService,
        pageContentService: PageContentService,
    ) {
        this.websiteService = websiteService;
        this.pageContentService = pageContentService;

    }

    // @Cron('45 * * * * *')
    @Cron(CronExpression.EVERY_5_SECONDS)
    async crawlWebsites() {
        const pendingWebsites = await this.websiteService.getWebsites();

        console.log('pendingWebsitespendingWebsites\n');
    }

}
