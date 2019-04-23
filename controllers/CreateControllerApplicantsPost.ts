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

export class CreateControllerApplicantsPost extends Controller {

    constructor() {
        super();
    }

    protected async processRequest(req: express.Request, res: express.Response): Promise<any> {
        // log request received
        this.log(LogLevels.INFO, 'CreateControllerApplicantsPost Request received', null, req);
        return new Promise<object>(async (resolve, reject) => {

            // first validate the incoming request
            const error: ServiceError = this.checkValidation(req);
            if (error !== null) {
                return this.resolvePromise(null, resolve, reject, error, null);
            }

            let json: object = null;

            try {
                const incomingUser: User = Object.assign(new User(), req.body.user);
                const hash: { salt: string, hash: string, iterations: number } = PwdUtils.hashPwd(incomingUser.password);
                incomingUser.password = hash.hash; // this could be done cleaner but I am in a hurry
                incomingUser.salt = hash.salt; // this could be done cleaner but I am in a hurry
                incomingUser.iterations = hash.iterations; // this could be done cleaner but I am in a hurry
                const user: User = await Context.DAO.createUser(incomingUser);
                json = {
                    user: user
                };
            } catch (e) {
                this.log(LogLevels.ERROR, e.message, null, req, e);
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
