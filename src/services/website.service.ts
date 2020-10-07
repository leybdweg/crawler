import {OnModuleInit} from "@nestjs/common";
import {Connection, createConnection} from "mysql2";
import {WebsiteContent, WebsiteContentStatus} from "./website-content.service";

export enum WebsiteStatus {
    pending = 'pending',
    completed = 'completed',
    failed = 'failed',
    processing = 'processing',
}

export interface Website {
    remainingPages: number;
    nextDepth: number;
    readonly id?: number;
    readonly url: string;
    status: WebsiteStatus;
    readonly maxDepth: number;
    readonly maxPages: number;
    readonly createdAt: string | Date;
    readonly lastUpdateAt: string | Date;

}

export class WebsiteService implements OnModuleInit {
    private readonly dbConnection: Connection;

    constructor() {
        this.dbConnection = createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER|| 'me',
            password: process.env.DB_PASSWORD || 'secret',
            database: process.env.DB_SCHEME || 'activefence',
            // debug: true,
            // trace: true,
            multipleStatements: true
        })
    }

    async onModuleInit(): Promise<void> {
        await this.dbConnection.promise().connect();
    }

    async createWebsite(website: Website): Promise<void> {
        const sql = 'INSERT INTO websites (state, url,  maxPages, remainingPages, maxDepth, nextDepth, createdAt, lastUpdateAt) VALUES(?, ? , ?, ? , ?, ? , ?, ? );';
        const replacements = [WebsiteStatus.pending,
            website.url,
            website.maxPages,
            website.maxPages,
            website.maxDepth,
            0, //nextDepth
            new Date(),
            new Date()
        ];
        let result;

        try {
            result = await this.dbConnection.promise().execute(sql, replacements);
        } catch (e) {
            console.error('Failed to create website \n'); // TODO: add more info to error log
        } finally { // TODO: consider a better approach
            // if(result[0]?.affectedRows != 1) {
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
                nextDepth: dbRow.nextDepth,
                remainingPages: dbRow.remainingPages,
                status: WebsiteStatus.pending // TODO: take from db?
            } as Website
        })

        return pendingWebsites;
    }

    async setWebsiteInProcess(website: Website, content: WebsiteContent): Promise<void> {
        const sql = `BEGIN;
                                UPDATE websites SET	state = ?,	lastUpdateAt = ?,	remainingPages = ?, nextDepth = ? WHERE	id = ?;
                                INSERT INTO websiteContent
                                        (url, title, anchorsLinks, websiteId, status, \`depth\`, queuePosition, createdAt, lastUpdateAt)
                                    VALUES
                                           (?,?,?,?,?,?,?,?,?);
                                COMMIT;`
        const replacements = [
           // websites
            WebsiteStatus.processing,
            new Date(),
            (website.maxPages - 1),
            (website.nextDepth + 1),
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

    async updateWebsite(website: Website) {
        const sql = `UPDATE websites SET	state = ?,	lastUpdateAt = ?,	remainingPages = ?, nextDepth = ? WHERE	id = ?;`
        const replacements = [
            website.status,
            new Date(),
            website.nextDepth,
            website.remainingPages,
            website.id
        ]
    }
}
