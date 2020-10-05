import {OnModuleInit} from "@nestjs/common";
import {Connection, createConnection} from "mysql2";

export enum WebsiteContentStatus {
    pending = 'pending',
    completed = 'completed', // already crawled
    failed = 'failed'
}
// (url, title, anchorsLinks, websiteId, status, `depth`, queuePosition, createdAt, lastUpdateAt)
export interface WebsiteContent {
    readonly id?: number;
    readonly url: string;
    readonly title?: string;
    readonly anchorsLinks?: string;
    readonly status: WebsiteContentStatus;
    readonly depth: number;
    readonly queuePosition: number;
    readonly createdAt: Date;
    readonly lastUpdateAt: Date;
}

export class WebsiteContentService implements OnModuleInit {
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
        await this.dbConnection.connect();
    }

    // async createWebsite(website: Website): Promise<void> {
    //     INSERT INTO websiteContent VALUES('', '', '', 0, 0, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    //
    //     const sql = 'INSERT INTO websiteContent (url, title, anchorsLinks, websiteId, status, `depth`, queuePosition, createdAt, lastUpdateAt)  VALUES(?, ? , ?, ? , ?, ? );';
    //     const replacements = [WebsiteContentStatus.pending, website.url, website.maxDepth, website.maxPages, new Date(), new Date()];
    //     let result;
    //
    //     try {
    //         result = await this.dbConnection.promise().execute(sql, replacements);
    //     } catch (e) {
    //         console.error('Failed to create website \n', e.sql); // TODO: add more info to error log
    //     } finally { // TODO: consider a better approach
    //         // if(result[0]?.affectedRows != 1) {
    //         if(!result) {
    //             throw new Error('Failed to persist website creation')
    //         }
    //     }
    // }
    //
    // async getWebsites(status: WebsiteContentStatus):Promise<Website[]> {
    //     const sql = 'SELECT * FROM websites where state = ?;'
    //     const replacements = [status];
    //     const dbResult = await this.dbConnection.promise().execute(sql, replacements);
    //
    //     const pendingWebsites: Website[] = (dbResult[0] as any[]).map(dbRow => {
    //         return {
    //             id: dbRow.id,
    //             url: dbRow.url,
    //             maxDepth: dbRow.maxDepth,
    //             maxPages: dbRow.maxPages,
    //             createdAt: dbRow.createdAt,
    //             lastUpdateAt: dbRow.lastUpdateAt,
    //             status: WebsiteContentStatus.pending // TODO: take from db?
    //         } as Website
    //     })
    //
    //     return pendingWebsites;
    // }
}
