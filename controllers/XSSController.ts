import {AbstractController} from './AbstractController';
import * as express from 'express';
import {LogLevels} from './AbstractController';
import {FilterXSS} from 'xss';
import {ServiceError} from '../error/ServiceError';

export class XSSController extends AbstractController {

    protected readonly xssConfig: object = {};

    constructor(xssConfig: object = {}) {
        super();
        this.xssConfig = xssConfig;
    }

    protected async processRequest(req: express.Request, res: express.Response): Promise<any> {
        try {
            // log request recieved
            this.log(LogLevels.INFO, 'XSSController Request recieved', null, req);
            const xss = new FilterXSS(this.xssConfig);
            req.body = (req.body) ? JSON.parse(xss.process(JSON.stringify(req.body))) : req.body;
            return req.body;
        } catch (e) {
            throw this.resolveServiceError(e);
        }
    }

    // override and call next to proceed with request
    protected next(req: express.Request, res: express.Response, next: (e?) => {}, result: any): void {
        next();
    }

    protected getSegmentName(): string {
        return 'XSSController';
    }
}
