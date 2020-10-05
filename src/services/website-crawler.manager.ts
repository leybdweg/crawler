import {Injectable} from '@nestjs/common';
// import {Connection, createConnection} from "mysql2/promise";
import {WebsiteService, WebsiteStatus} from "./website.service";
import {Cron, CronExpression} from "@nestjs/schedule";
// import * as aa from 'simplecrawler';
import * as Crawler from 'crawler';
import {WebsiteContent, WebsiteContentService, WebsiteContentStatus} from "./website-content.service";

// import * as mpromise from "mysql2/promise";

interface WebsiteLinks {
    links: string[],
    remainingPages: number,
    remainingDepth: number,
}

@Injectable()
export class WebsiteCrawlerManager {
    private readonly websiteService: WebsiteService;
    private readonly websiteContentService: WebsiteContentService;
    // private toBeCrawled = new Map<number, WebsiteLinks>([]);
    private readonly crawler: any;

    constructor(
        websiteService: WebsiteService,
        websiteContentService: WebsiteContentService,
    ) {
        this.websiteService = websiteService;
        this.websiteContentService = websiteContentService;

        this.crawler = new Crawler({
            rateLimit: 2000,
            maxConnections: 1,
            callback: async (error, res, done) => {
                if (error) {
                    console.log(error)
                } else {
                    const url = res.options.uri;
                    const title = res.$('title').text();
                    const links = [];
                    res.$('a').each(function () {
                        links.push(res.$(this).attr('href'));
                    });

                }
                done();
            }
        });
    }

    // @Cron('45 * * * * *')
    @Cron(CronExpression.EVERY_5_SECONDS)
    async crawlNewWebsites(): Promise<void> {
        const pendingWebsites = await this.websiteService.getWebsites(WebsiteStatus.pending);
        for (const pendingWebsite of pendingWebsites) {
            await this.crawler.direct({
                uri: pendingWebsite.url,
                skipEventRequest: false,
                callback: async (err, response) => {
                    const title = response.$('title').text();
                    const links = [];
                    response.$('a').each(function () {
                        links.push(response.$(this).attr('href'));
                    })
                    await this.websiteService.setWebsiteInProcess(pendingWebsite, {
                        anchorsLinks: JSON.stringify(links),
                        createdAt: new Date(),
                        lastUpdateAt: new Date(),
                        depth: 0,
                        status: WebsiteContentStatus.completed,
                        title: title,
                        queuePosition: 0,
                        url: pendingWebsite.url
                    } as WebsiteContent);
                }
            })
        }

    }

}
