import {Injectable, OnModuleInit} from '@nestjs/common';
// import {Connection, createConnection} from "mysql2/promise";
import {Connection, createConnection} from "mysql2";
// import * as mysql from 'mysql2/promise'
// import * as mpromise from "mysql2/promise";
@Injectable()
export class WebsiteCrawlerService implements OnModuleInit {
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

    async getHello(): Promise<string> {
        let result;
        // this.dbConnection.
        try {
            result  = await this.dbConnection.promise().execute('select * from websites;', [])
        } catch (e) {
            console.log('errrrr')
            console.log(e)
        }
        return `db result ${result[0]}`;
    }


}
