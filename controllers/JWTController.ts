import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import {AbstractController, LogLevels} from './AbstractController';
import {ServiceError} from '../error/ServiceError';

export class JWTController extends AbstractController {
    protected async processRequest(req: express.Request, res: express.Response): Promise<any> {
        try {
            // log request recieved
            this.log(LogLevels.INFO, 'JWTController Request recieved', null, req);
            let header: string = process.env.JWT_HEADER || 'authorization';
            header = header.toLowerCase();
            // allow case insensitive header names
            const headerValue: string | string[] = req.headers[Object.keys(req.headers).find(key => key.toLowerCase() === header)];
            let token: string | string[] = null;

            if (!headerValue) {
                throw new ServiceError('No token provided.', 403);;
            }

            // split authorization header to extract authentication type
            // authorization header should be in the format: <type> <credentials>
            // cast headerValue to a string before calling split because headerValue is of
            // type string[] which does not have a split method
            const valueParts = (headerValue as string).split(' ');

            if (valueParts.length !== 2) {
                throw new ServiceError('Invalid authorization header format.', 403);
            }

            switch (valueParts[0]) {
                case 'Bearer':
                    token = valueParts[1];
                    break;
                default:
                    throw new ServiceError('Unsupported authentication type.', 403);
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // attach token to the request
            req['token'] = decoded;
            // return decoded
            return decoded;
        } catch (e) {
            throw this.resolveServiceError(e);
        }
    }
    // override and call next to proceed with request
    protected next(req: express.Request, res: express.Response, next: (e?) => {}, result: any): void {
        next();
    }
    // stub for override
    protected getSegmentName(): string {
        return 'JWTController';
    }
}
