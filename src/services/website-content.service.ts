import {OnModuleInit} from "@nestjs/common";
import {Connection, createConnection} from "mysql2";
import {Website} from "./website.service";

export enum WebsiteContentStatus {
    pending = 'pending',
    completed = 'completed', // already crawled
    failed = 'failed'
}
// (url, title, anchorsLinks, websiteId, status, `depth`, queuePosition, createdAt, lastUpdateAt)
export interface WebsiteContent {
    readonly id?: number;
    readonly url: string;
    readonly title: string;
    readonly websiteId: number;
    readonly anchorsLinks: string;
    readonly status: WebsiteContentStatus;
    readonly depth: number;
    readonly queuePosition: number;
    readonly createdAt: Date;
    readonly lastUpdateAt: Date;
}

export class WebsiteContentService implements OnModuleInit {
    private readonly dbConnection: Connection;
    private cachedContent: WebsiteContent[];

    constructor() {
        this.cachedContent = [];

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
        await this.dbConnection.connect();
        setInterval(async ()=>{
            this.cachedContent = await this.getContentsFromDb()
        }, 10000)
    }

    async createContent(website: Website, websiteContent: WebsiteContent): Promise<void> {

        const sql = `INSERT INTO websiteContent
                                        (url, title, anchorsLinks, websiteId, status, \`depth\`, queuePosition, createdAt, lastUpdateAt)
                                    VALUES
                                           (?,?,?,?,?,?,?,?,?);`;
        const replacements = [
            websiteContent.url,
            websiteContent.title,
            websiteContent.anchorsLinks,
            website.id,
            websiteContent.status,
            websiteContent.depth,
            websiteContent.queuePosition,
            websiteContent.createdAt,
            websiteContent.lastUpdateAt,
        ];
        let result;

        try {
            result = await this.dbConnection.promise().execute(sql, replacements);
        } catch (e) {
            console.error('Failed to create website content \n'); // TODO: add more info to error log
        } finally { // TODO: consider a better approach
            // if(result[0]?.affectedRows != 1) {
            if(!result) {
                throw new Error('Failed to persist website creation')
            }
        }
    }


    async getContentsFromWebsite(website: Website):Promise<WebsiteContent[]> {
        const sql = 'SELECT * FROM websiteContent where websiteId = ? order by queuePosition desc;'
        const replacements = [website.id];
        const dbResult = await this.dbConnection.promise().execute(sql, replacements);

        const pendingWebsites: WebsiteContent[] = (dbResult[0] as any[]).map(dbRow => {
            return {
                id: dbRow.id,
                anchorsLinks: dbRow.anchorsLinks,
                createdAt: new Date(dbRow.createdAt),
                depth: dbRow.depth,
                lastUpdateAt: new Date(dbRow.lastUpdateAt),
                queuePosition: dbRow.queuePosition,
                status: dbRow.status,
                title: dbRow.title,
                url: dbRow.url,
            } as WebsiteContent
        })

        return pendingWebsites;
    }

    public getContents():WebsiteContent[]{
        return this.cachedContent;
    }

    private async getContentsFromDb(status?: WebsiteContentStatus):Promise<WebsiteContent[]> {
        let sql = 'SELECT * FROM websiteContent';
        const replacements = [];
        if(status){
            sql += ' WHERE status = ?'
            replacements.push(status)
        }

        sql += ' order by createdAt desc;'
        const dbResult = await this.dbConnection.promise().execute(sql, replacements);

        const pendingWebsites: WebsiteContent[] = (dbResult[0] as any[]).map(dbRow => {
            return {
                id: dbRow.id,
                anchorsLinks: dbRow.anchorsLinks,
                createdAt: new Date(dbRow.createdAt),
                depth: dbRow.depth,
                lastUpdateAt: new Date(dbRow.lastUpdateAt),
                queuePosition: dbRow.queuePosition,
                status: dbRow.status,
                title: dbRow.title,
                url: dbRow.url,
            } as WebsiteContent
        })

        return pendingWebsites;
    }
}
