import {OnModuleInit} from "@nestjs/common";
import {Connection, createConnection} from "mysql2";

export enum WebsiteStatus {
    pending = 'pending',
    completed = 'completed',
    failed = 'failed'
}
export interface Website {
    readonly id?: number;
    readonly url: string;
    readonly status: WebsiteStatus;
    readonly maxDepth: number;
    readonly maxPages: number;
    readonly createdAt: string;
    readonly lastUpdateAt: string;

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
        await this.dbConnection.connect();
    }

    async createWebsite(website: Website): Promise<void> {
        const sql = 'INSERT INTO websites (state, url, maxDepth, maxPages, createdAt, lastUpdateAt) VALUES(?, ? , ?, ? , ?, ? );';
        const replacements = [WebsiteStatus.pending, website.url, website.maxDepth, website.maxPages, new Date(), new Date()];
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
}
