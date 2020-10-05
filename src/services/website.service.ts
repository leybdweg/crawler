import {OnModuleInit} from "@nestjs/common";
import {Connection, createConnection} from "mysql2";
import {WebsiteContent, WebsiteContentStatus} from "./website-content.service";

export enum WebsiteStatus {
    pending = 'pending',
    completed = 'completed',
    failed = 'failed',
    inProcess = 'inProcess',
}

export interface Website {
    remainingPages: number;
    remainingDepth: number;
    readonly id?: number;
    readonly url: string;
    readonly status: WebsiteStatus;
    readonly maxDepth: number;
    readonly maxPages: number;
    readonly createdAt: string | Date;
    readonly lastUpdateAt: string | Date;

}

export class WebsiteService implements OnModuleInit {
    private readonly dbConnection: Connection;

    constructor() {
        this.dbConnection = createConnection({
            host: 'localhost',
            user: 'me',
            password: 'secret',
            database: 'activefence',
            // debug: true,
            // trace: true,
            multipleStatements: true
        })
    }

    async onModuleInit(): Promise<void> {
        await this.dbConnection.promise().connect();
    }

    async createWebsite(website: Website): Promise<void> {
        const sql = 'INSERT INTO websites (state, url, maxDepth, maxPages, remainingPages, remainingDepth, createdAt, lastUpdateAt) VALUES(?, ? , ?, ? , ?, ? , ?, ? );';
        const replacements = [WebsiteStatus.pending,
            website.url,
            website.maxDepth,
            website.maxPages,
            website.maxDepth,
            website.maxPages,
            new Date(),
            new Date()
        ];
        let result;

        try {
            result = await this.dbConnection.promise().execute(sql, replacements);
        } catch (e) {
            console.error('Failed to create website \n', e.sql); // TODO: add more info to error log
        } finally { // TODO: consider a better approach
            if(!result) {
                throw new Error('Failed to persist website creation')
            }
        }
    }

    async getWebsites(status: WebsiteStatus):Promise<Website[]> {
        const sql = 'SELECT * FROM websites where state = ?;'
        const replacements = [status];
        const dbResult = await this.dbConnection.promise().execute(sql, replacements);

        const pendingWebsites: Website[] = (dbResult[0] as any[]).map(dbRow => {
            return {
                id: dbRow.id,
                url: dbRow.url,
                maxDepth: dbRow.maxDepth,
                maxPages: dbRow.maxPages,
                createdAt: dbRow.createdAt,
                lastUpdateAt: dbRow.lastUpdateAt,
                status: WebsiteStatus.pending // TODO: take from db?
            } as Website
        })

        return pendingWebsites;
    }

    async setWebsiteInProcess(website: Website, content: WebsiteContent): Promise<void> {
        const sql = `BEGIN;
                                UPDATE websites SET	state = ?,	lastUpdateAt = ?,	remainingPages = ? WHERE	id = ?;
                                INSERT INTO websiteContent
                                        (url, title, anchorsLinks, websiteId, status, \`depth\`, queuePosition, createdAt, lastUpdateAt)
                                    VALUES
                                           (?,?,?,?,?,?,?,?,?);
                                COMMIT;`
        const replacements = [
           // websites
            WebsiteStatus.inProcess,
            new Date(),
            (website.maxPages - 1),
            website.id,
            // content
            content.url,
            content.title,
            content.anchorsLinks,
            website.id,
            content.status,
            content.depth,
            content.queuePosition,
            content.createdAt,
            content.lastUpdateAt,
        ];

        try {
            await this.dbConnection.promise().query(sql, replacements);
        } catch (e) {
            console.error(e);
        }
    }
}
