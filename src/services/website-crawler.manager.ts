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
            callback: (error, res, done) => {
            }
        });
    }

    // @Cron('45 * * * * *')
    @Cron(CronExpression.EVERY_WEEK)
    async crawlNewWebsites(): Promise<void> {
        console.log('######## crawlNewWebsites ###########')
        const pendingWebsites = await this.websiteService.getWebsites(WebsiteStatus.pending);
        for (const pendingWebsite of pendingWebsites) {
            await this.crawler.direct({
                uri: pendingWebsite.url,
                skipEventRequest: false,
                callback: async (err, response) => {
                    const title = response.$('title').text();
                    const links = [];
                    response.$('a').each(function () {
                        const href = response.$(this).attr('href')
                        if (href && href != '#' && href != '/') { // there can be better ways to do this
                            links.push(response.$(this).attr('href'));
                        }
                    })
                    await this.websiteService.setWebsiteInProcess(pendingWebsite, {
                        anchorsLinks: JSON.stringify(links),
                        createdAt: new Date(),
                        lastUpdateAt: new Date(),
                        depth: 1,
                        status: WebsiteContentStatus.completed,
                        title: title,
                        queuePosition: 0,
                        url: pendingWebsite.url
                    } as WebsiteContent);
                }
            })
        }
    }

    @Cron(CronExpression.EVERY_WEEK)
    async crawlWebsites(): Promise<void> {
        console.log('-------crawlWebsites-----------')
        const processingWebsites = await this.websiteService.getWebsites(WebsiteStatus.processing);
        for (const processingWebsite of processingWebsites) {
            const existingPageContents = await this.websiteContentService.getContentsFromWebsite(processingWebsite);
            let queueCounter = existingPageContents.length;
            // processingWebsite.remainingPages = processingWebsite.maxPages - existingPageContents.length;
            const contents = existingPageContents.filter(content => content.depth === processingWebsite.nextDepth)
            processingWebsite.nextDepth += 1;
            for (const websiteContent of contents) {
                const anchorLinks = JSON.parse(websiteContent.anchorsLinks)
                for (const anchorLink of anchorLinks) {
                    // href can be partial (relative to same domain)
                    const url = anchorLink.match(/https?:\/\//) ? anchorLink : `${websiteContent.url}${anchorLink}`
                    console.log('fullUrlfullUrlfullUrl -->>> ', url)
                    this.crawler.direct({
                        uri: url,
                        skipEventRequest: false,
                        callback: async (err, response) => {
                            const title = response.$('title').text();
                            const links = [];
                            response.$('a').each(function () {
                                links.push(response.$(this).attr('href'));
                            })
                            queueCounter++;
                            await this.websiteContentService.createContent(processingWebsite, {
                                anchorsLinks: JSON.stringify(links),
                                createdAt: new Date(),
                                lastUpdateAt: new Date(),
                                depth: processingWebsite.nextDepth,
                                status: WebsiteContentStatus.completed,
                                title: title,
                                queuePosition: queueCounter,
                                url: url
                            } as WebsiteContent);
                        }
                    })
                    processingWebsite.remainingPages -= 1;
                    // TODO: race-condition due to callback is bring more than necessary
                    if (processingWebsite.remainingPages <= 0) {
                        processingWebsite.status = WebsiteStatus.completed;
                        break;
                    }
                }
            }

            await this.websiteService.updateWebsite(processingWebsite);
        }
    }


}
