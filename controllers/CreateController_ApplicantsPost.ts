import {ServiceError} from '../error/ServiceError';
import {SecurityException} from '../error/SecurityException';
import {LogLevels} from './AbstractController';
import {IContext} from "../core/IContext";
import { validate, ValidationOptions, ValidationResult as JoiValidationResult } from 'joi';
import * as express from 'express';
import {Controller} from './Controller';

export class CreateController_ApplicantsPost extends Controller {

    constructor() {
        super();
    }

    protected async processRequest(req: express.Request, res: express.Response): Promise<any> {
        // log request received
        this.log(LogLevels.INFO, 'CreateController_ApplicantsPost Request received', null, req);
        return new Promise<object>(async (resolve, reject) => {

            // first validate the incoming request
            const error: ServiceError = this.checkValidation(req)
            if(error !== null ){
                return this.resolvePromise(null, resolve, reject, error, null)
            }

            let json: any = null;

            try {

                // create context
                const context: IContext = this.createContext();

                // TODO: code out your controller logic, be sure to pass context to your business objects.
                // This makes your code threadsafe when accessing service objects
                // always access service objects via the context

                // TODO: set JSON to return
                json = {
                    tmp: "someValue"
                };

            } catch (e) {
                const error: ServiceError = this.resolveServiceError(e);
                this.log(LogLevels.ERROR, e.message, null, req, e);

                return this.resolvePromise(null, resolve, reject, error, null);
            }

            // set response headers, if you do not want cors enabled remove these headers and update the serverless.yml removing cors blocks
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Access-Control-Allow-Credentials', true);

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
            //id: string().required(),
            //someValue: string().required()
        }
    }
}
