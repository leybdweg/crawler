import {OnModuleInit} from "@nestjs/common";
import {Connection, createConnection} from "mysql2";

export interface PageContent {
    readonly id?: number;
    readonly pageId: number; // foreign key
    readonly title: string;
    readonly anchorsLinks: string;
    readonly createdAt: string;
    readonly lastUpdateAt: string;

}
export class PageContentService implements OnModuleInit {
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

    async createContent(pageContent: PageContent): Promise<void> {
        const sql = 'INSERT INTO pageContent (pageId, title, anchorsLinks, createdAt, lastUpdateAt) VALUES(?,?,?,?,?);';
        const replacements = [pageContent.pageId,pageContent.title, pageContent.anchorsLinks, new Date(), new Date()];
        let result;

        try {
            result = await this.dbConnection.promise().execute(sql, replacements);
        } catch (e) {
            console.error('Failed to create page content \n', e.sql); // TODO: add more info to error log
        } finally { // TODO: consider a better approach
            if(!result) {
                throw new Error('Failed to persist website creation')
            }
        }
    }
}
