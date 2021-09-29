import './util/module-alias';
import { Server } from '@overnightjs/core';
import { Application } from 'express';
import bodyParser from 'body-parser';
import { ForecastController } from './controllers/forecast';
import * as database from './database';
import { BeachController } from './controllers/beach';
import { UserController } from './controllers/user';
import logger from './logger';

export class SetupServer extends Server {
    constructor(private port = 3000) {
        super();
    }

    public async init(): Promise<void> {
        this.setupExpress();
        this.setupControllers();
        await this.databaseSetup();
    }

    private setupExpress(): void {
        this.app.use(bodyParser.json());
        this.setupControllers();
    }

    private setupControllers(): void {
        const forecastController = new ForecastController();
        const beachController = new BeachController();
        const userController = new UserController();
        this.addControllers([forecastController, beachController, userController]);
    }

    public getApp(): Application {
        return this.app;
    }

    private async databaseSetup() : Promise<void> {
        await database.connect();
    }

    public async close(): Promise<void> {
        await database.close();
    }

    public start (): void {
        this.app.listen(this.port, () => {
            logger.info('Server listening on port: ' + this.port);
        });
    }
}
