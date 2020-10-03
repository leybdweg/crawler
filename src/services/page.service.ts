import {OnModuleInit} from "@nestjs/common";
import {Connection, createConnection} from "mysql2";

export enum PageStatus {
    pending = 'pending',
    onWork = 'onWork',
    completed = 'completed',
    failed = 'failed'
}
export interface Page {
    readonly id?: number;
    readonly websiteId: number;
    readonly status: PageStatus;
    readonly path: string;
    readonly depth: number;
    readonly queuePosition: number;
    readonly createdAt: string;
    readonly lastUpdateAt: string;
}

export class PageService implements OnModuleInit {
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

    async createPage(page: Page): Promise<void> {
        const sql = 'INSERT INTO pages (`path`, websiteId, status, `depth`, queuePosition, createdAt, lastUpdateAt) VALUES(?,?,?,?,?,?,?);';
        const replacements = [page.path, page.websiteId, PageStatus.pending, page.depth, page.queuePosition, new Date(), new Date()];
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
}
