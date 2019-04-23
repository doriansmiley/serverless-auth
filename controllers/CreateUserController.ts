import {ServiceError} from '../error/ServiceError';
import {SecurityException} from '../error/SecurityException';
import {LogLevels} from './AbstractController';
import {IContext} from '../core/IContext';
import {Context} from '../core/Context';
import {string, object, number, validate, ValidationOptions, ValidationResult as JoiValidationResult} from 'joi';
import * as express from 'express';
import {Controller} from './Controller';
import {User} from '../model/entity/User';
import {PwdUtils} from '../util/PwdUtils';

export class CreateUserController extends Controller {

    constructor() {
        super();
    }

    protected async processRequest(req: express.Request, res: express.Response): Promise<any> {
        // log request received
        this.log(LogLevels.INFO, 'CreateUserController Request received', null, req);
        try {
            // first validate the incoming request
            const error: ServiceError = this.checkValidation(req);
            if (error !== null) {
                throw error;
            }
            const incomingUser: User = Object.assign(new User(), req.body.user);
            const hash: { salt: string, hash: string, iterations: number } = PwdUtils.hashPwd(incomingUser.password);
            incomingUser.password = hash.hash;
            incomingUser.salt = hash.salt;
            incomingUser.iterations = hash.iterations;
            const user: User = await Context.DAO.createUser(incomingUser);
            return {
                user: user
            };
        } catch (e) {
            this.log(LogLevels.ERROR, e.message, null, req, e);
            if (e instanceof ServiceError) {
                // rethrow error, this allows us to return 4xx or 5xx based on the error
                throw e;
            }
            throw new ServiceError(e.message, 500);
        }
    }

    // This function should match route route controller's http verb
    protected getSegmentName(): string {
        return 'Create';
    }

    protected getSchema(): object {
        // This is called by AbstractController.validate and is run against req.body
        // you can also override the AbstractController.getOptions which returns the schema options
        // for more information see joi validation and schema options
        return {
            user: object({
                firstName: string().required(),
                lastName: string().required(),
                email: string().required(),
                username: string().required(),
                password: string().required()
            }).required()
        };
    }
}
