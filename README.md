# Serverless Authentication Sample - 1.0
Sample serverless API that performs username and password authentication

<!-- 
TODO: add badges
# <a href="https://circleci.com/gh/MFourMobile/mfour-auto-complete-service">
# <img src="https://circleci.com/gh/MFourMobile/mfour-auto-complete-service.svg?style=shield&circle-token=6ade52254f840a128823978162dd02efdde393f6" alt="Build Status"></a>
-->

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

You will need to build the app when making changes and before testing.
```bash
npm run build
```

## Testing

### Unit Tests

Make sure you have the environment variables setup from the previous step.

To run all tests (not environment specific integrations) you can simply run this command:
```bash
yarn run test
```

### Offline Testing

Serverless can emulate a webserver and allow you to hit the gateway function using curl or Postman


```bash
serverless offline start --stage local \
    --host $TEST_API_GATEWAY_HOST \
    --port $TEST_API_GATEWAY_PORT \
    --alert-email $ALERT_EMAIL
```

Your service will be accessible on `localhost:3000`.

## Deployment

We deploy to AWS using serverless directly. You will need the AWS Credentials setup on your machine. Check with DevOps if you need help with this

```bash
serverless deploy -v --stage $STAGE \
    --alert-email $ALERT_EMAIL \
    --DbUser $DB_USER \
    —-DbPwd $DB_PWD
```

### Tear Down

To take down a deployed stack, you can use the `remove` command with a stage name.

While at the root of the serverless application, run:

```bash
serverless remove --stage <stage_name>
```

Before removing the stack with serverless, you have to ensure that all S3 buckets in the stack are emptied.

This will include the main bucket serverless uses to upload the labmda function bundle in addition to any custom buckets you add in cloud formation.
