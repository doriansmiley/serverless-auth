import {ServiceError} from '../error/ServiceError';
import {SecurityException} from '../error/SecurityException';
import {LogLevels} from './AbstractController';
import {IContext} from '../core/IContext';
import {object, string, validate, ValidationOptions, ValidationResult as JoiValidationResult} from 'joi';
import * as express from 'express';
// IMPORTANT: this forces the driver to be included, without it it's dropped during tree shacking with dev dependency plugin
const mysql = require('mysql');
import {Controller} from './Controller';
import {User} from '../model/entity/User';
import {Context} from '../core/Context';
import {PwdUtils} from '../util/PwdUtils';

export class CreateSessionController extends Controller {

    constructor() {
        super();
    }

    protected async processRequest(req: express.Request, res: express.Response): Promise<any> {
        // log request received
        this.log(LogLevels.INFO, 'CreateSessionController Request received', null, req);
        return new Promise<object>(async (resolve, reject) => {

            // first validate the incoming request
            const error: ServiceError = this.checkValidation(req);
            if (error !== null ) {
                return this.resolvePromise(null, resolve, reject, error, null);
            }

            let json: any = null;

            try {
                const incomingUser: User = Object.assign(new User(), req.body.user);
                const user: User = await Context.DAO.readUser(Object.assign(new User(), req.body.user));
                const match = PwdUtils.validatePwd(incomingUser.password, user.salt, user.password, user.iterations);
                if (!match) {
                    throw new ServiceError('Username or password does not match', 400);
                }
                // TODO: constrcut JWT and return
                json = {
                    user: user
                };

            } catch (e) {
                this.log(LogLevels.ERROR, e.message, null, req, e);
                if (e instanceof ServiceError) {
                    // rethrow error, this allows us to return 4xx or 5xx based on the error
                    throw e;
                }
                return this.resolvePromise(null, resolve, reject, this.resolveServiceError(e), null);
            }

            return this.resolvePromise(json, resolve, reject, null, null);
        });
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
