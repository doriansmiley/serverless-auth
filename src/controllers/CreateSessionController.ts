import {ServiceError} from '../error/ServiceError';
import {SecurityException} from '../error/SecurityException';
import {LogLevels} from './AbstractController';
import {IContext} from '../core/IContext';
import {object, string, validate, ValidationOptions, ValidationResult as JoiValidationResult} from 'joi';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
// IMPORTANT: this forces the driver to be included, without it it's dropped during tree shacking with dev dependency plugin
const mysql = require('mysql');
import {AbstractController} from './AbstractController';
import {User} from '../model/entity/User';
import {Context} from '../core/Context';
import {PwdUtils} from '../util/PwdUtils';

export class CreateSessionController extends AbstractController {

    constructor() {
        super();
    }

    protected async processRequest(req: express.Request, res: express.Response): Promise<any> {
        try {
            // log request received
            this.log(LogLevels.INFO, 'CreateSessionController Request received', null, req);
            // first validate the incoming request
            const error: ServiceError = this.checkValidation(req);
            if (error !== null ) {
                throw error;
            }
            const incomingUser: User = Object.assign(new User(), req.body.user);
            const user: User = await Context.DAO.readUser(Object.assign(new User(), req.body.user));
            const match = PwdUtils.validatePwd(incomingUser.password, user.salt, user.password, user.iterations);
            if (!match) {
                throw new ServiceError('Username or password does not match', 400);
            }
            return {
                jwt: jwt.sign({userId:user.id}, process.env.JWT_SECRET)
            };

        } catch (e) {
            this.log(LogLevels.ERROR, e.message, null, req, e);
            throw this.resolveServiceError(e);
        }
    }

    // This function should match route route controller's http verb
    protected getSegmentName(): string {
        return 'Create';
    }

    protected getSchema(): object {
        // TODO: add you schema validation.
        // This is called by AbstractController.validate and is run against req.body
        // you can also override the AbstractController.getOptions which returns the schema options
        // for more information see joi validation and schema options
        return {
            user: object({
                username: string().required(),
                password: string().required()
            }).required()
        };
    }
}
