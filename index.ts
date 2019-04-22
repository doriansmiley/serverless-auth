import {IDao} from "./dao/IDao";
var serverless = require('serverless-http');
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as AWSXRay from 'aws-xray-sdk';
import {XSSController} from './controllers/XSSController';
import {CreateController_UsersPost} from './controllers/CreateController_UsersPost'
import {CreateController_ApplicantsPost} from './controllers/CreateController_ApplicantsPost'
import {DaoFactory} from './dao/DaoFactory';
import {Context} from './core/Context';

const app = express();

// for parsing application/json
app.use(bodyParser.json());

// init XRay middleware, all controllers, DAOs, etc will append sub-segments
app.use(AWSXRay.express.openSegment('Auth API'));

// IMPORTANT: all routes that do not require JWT authentication must be declared ahead of registering the middleware with app.use
app.get('/', function (req, res) {
    res.status(200).send('Hello World! I am the Auth API ' +  process.env.API_VERSION);
});

// init dao factory
const factory = new DaoFactory();
// initialize mongo connection
// we are putting the await Context.MONGO_DAO.connect() inside this middleware
// to pause execution while mongo connects
app.use(async function(req, res, next) {
    if (!Context.DAO) {
        Context.DAO = factory.getDAO('mysql') as IDao;
        await Context.DAO.connect();
    }
    next();
});

// IMPORTANT: API Gateway & Lambda can not be used as a web server to serve static content!!!
// If you run this API locally with app.listen(3001, () => console.log('Example app listening on port 3001!'))
// you can access the docs at /api-docs, otherwise the dependent files in the returned HTML will fail to load.
// require OpenAPI spec
// const swaggerDocument = require('./apiSpec.json');
// add swagger docs
// app.use('/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// JWT authentication
// the JWT controller will validate JWT tokens, since we only have sign up and login routes this doesn't apply
// a pattern that is sometimes useful is to authenticate using Lambda edge and pass in JWT tokens for all static front ends
// this helps certify traffic to all API endpoints is coming from an authorized source
// for a coding test his was overkill
// app.use(/(\/v[0-9])?/, new JWTController().register());

const xssConfig = {
    stripIgnoreTag: true
};

app.use(/(\/v[0-9])?/, new XSSController(xssConfig).register());

//define API routes

app.post('(\/v[0-9])?/users/sessions', new CreateController_UsersPost().register());

app.post('(\/v[0-9])?/users', new CreateController_ApplicantsPost().register());



// IMPORTANT: Must be last!
app.use(AWSXRay.express.closeSegment());

const wrapper = serverless(app, {callbackWaitsForEmptyEventLoop: false});

const handler = async (event, context, callback) => {
    // This enables Lambda function to complete
    context.callbackWaitsForEmptyEventLoop = false;
    return new Promise(async (resolve, reject) => {
        try{
            /** Immediate response for WarmUP plugin */
            if (event.source === 'serverless-plugin-warmup') {
                console.log('WarmUP - Lambda is warm!')
                return resolve('Lambda is warm!');
            }
            const result = await wrapper(event, context);
            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
};

module.exports.handler = handler;
