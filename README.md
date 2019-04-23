# Serverless Authentication Sample - 1.0
Sample serverless API that performs username and password authentication. Passwords are hashed and salted using node's built in crypto lib.
The serverless config will deploy the entire stack including subnets, gateways, and rds. For API documentation refer to the ApiSpec.json file.
You can use https://editor.swagger.io/ to view the file.

During development I did discover two things regarding TypeORM:
* https://github.com/typeorm/typeorm/issues/3427 - It appears that TypeORM needs some special connection handling in Lambda.
This was a real pain to track down and it's not top line in their documentation. I also added a comment in the code. Better documentation on connection handling would have saved me several hours here.
* TypeORM seems to fail silently when data type overflows column definition. Try the following cURL request a few times in a row:
```bash
curl --header "Content-Type: application/json" \
    --request POST \
    --data '{"user":{"firstName": "Dorian", "lastName": "Smiley", "email": "doriansmiley@somehwere.com", "username": "testUser_007867352595040011", "password": "password"}}' \
    https://umen1vjrng.execute-api.us-west-2.amazonaws.com:443/dev/v1/users
```
The user appears to be added despite having the same username. The username is 27 characters but the limit is 26.
Now remove any character from the username and repeat the test. Attempts to add the user multiple times now fail. I did not try to implement a unique constraint on the column.
As far as I can tell the find method is failing silently and not adding the user.

<!-- 
TODO: add badges
# <a href="https://circleci.com/gh/MFourMobile/mfour-auto-complete-service">
# <img src="https://circleci.com/gh/MFourMobile/mfour-auto-complete-service.svg?style=shield&circle-token=6ade52254f840a128823978162dd02efdde393f6" alt="Build Status"></a>
-->
## Use of http-serverless
Some developers ask why the use of http-serverless which wraps express APIs. Using http-serverless makes the API more portable.
You can deploy the API as either a docker container or serverless application using API Gateway and Lambda.
The downside however are somewhat bloated lambda function functions. I prefer this approach though
as it can give you more deployment options.

## Data Abstractions
I opted to encapsulate TypeORM repository operation in a DAO and abstract the implementation to a factory. This allows for a clean
migration path away from TypeORM and abstracts away persistence details. The DAO API can remain consistent regardless of the driver implementation.
## Dependencies

Make sure node is installed.

Global npm packages are required

```bash
npm install grunt serverless -g
```

**Important!:** Make sure you are on the same nodejs runtime as lambda. Currently its on **_v8.10_**.

### Environment Variables

The following environment variables are required by the functions.

```bash
# Local Testing
export TEST_API_GATEWAY_HOST=localhost
export TEST_API_GATEWAY_PORT=3000
export TEST_API_PROTOCOL=http:
export DB_HOST=localhost,
export DB_PORT=3306,
export DB_NAME=test,
export DB_USER=<username>,
export DB_PWD=<password>,
export DB_TYPE=mysql

# AWS Integration Testing
export TEST_API_GATEWAY_HOST=<output endpoint>
export TEST_API_GATEWAY_PORT=443
export TEST_API_PROTOCOL=https:
export DB_HOST=10.0.0.0
export DB_PORT=3306,
export DB_NAME=test,
export DB_USER=<username>,
export DB_PWD=<password>,
export DB_TYPE=mysql
```

## Building

To build the app run. Note the test command will run this for you.
```bash
npm run build
```

## Testing

Make sure you have the environment variables setup from the previous step.

To run all tests locally
```bash
export TEST_API_GATEWAY_HOST=localhost
export TEST_API_GATEWAY_PORT=3000
export TEST_API_PROTOCOL=http:

export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=test
export DB_USER=<username>
export DB_PWD=<password>
export DB_TYPE=mysql
export ALERT_EMAIL=<email>
export STAGE=local

npm test
```
To run integration tests after deployment
```bash
export TEST_API_GATEWAY_HOST=<service endpoint, for example umen1vjrng.execute-api.us-west-2.amazonaws.com>
export TEST_API_GATEWAY_PORT=443
export TEST_API_PROTOCOL=https:
# we unset DB_HOST and DB_PORT because the ENV vars are preffered in environment config
# we want to use stack ouputs
unset DB_HOST
unset DB_PORT
export DB_NAME=test
export DB_USER=<username>
export DB_PWD=<password>
export DB_TYPE=mysql
export ALERT_EMAIL=<email>
export STAGE=dev

npm test
```

### Offline Testing

Serverless can emulate a webserver and allow you to hit the gateway function using curl or Postman


```bash
    --host $TEST_API_GATEWAY_HOST \
          --port $TEST_API_GATEWAY_PORT \
          --DbHost $DB_HOST \
          --DbPort $DB_PORT \
          --DbUser $DB_USER \
          --DbPwd $DB_PWD \
          --alert-email $ALERT_EMAIL
```

Your service will be accessible on `localhost:3000`.

## Deployment

We deploy to AWS using serverless directly. You will need the AWS Credentials setup on your machine with the appropriate permissions.

```bash
# we unset DB_HOST and DB_PORT because the ENV vars are preffered in environment config
# we want to use stack ouputs
unset DB_HOST
unset DB_PORT
serverless deploy -v --force --stage $STAGE \
    --alert-email $ALERT_EMAIL \
    --DbUser $DB_USER \
    --DbPwd $DB_PWD
```
Serverless will deploy the following:
* API Gateway setup
* Lambda Function triggered by API Gateway
* IAM roles and permissions
* Cloudwatch Alarms
* VPS with two public subnets and two private subnets with nat gateway
* RDS instance using mysql

### Tear Down

To take down a deployed stack, you can use the `remove` command with a stage name.

While at the root of the serverless application, run:

```bash
serverless remove --stage <stage_name>
```
