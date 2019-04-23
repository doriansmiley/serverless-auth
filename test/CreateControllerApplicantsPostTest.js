'use strict';

const http = require('http');
const https = require('https');
const assert = require('assert');
const jwt = require('jsonwebtoken');
const fs = require("fs");

describe('Testing service routes', function () {
    // TODO: refactor these tests once business logic is implemented in your controllers
    const tmpValues = {
        tmp: 'someValue'
    };

    const jsonArtifact = JSON.stringify(tmpValues);

    it('should POST to /v1/users and return invalid request 400', function (done) {
        const clientId = '1111';
        const postData = {
            clientId: clientId,
            tmpValues: jsonArtifact
        };

        const token = jwt.sign({clientId: clientId}, process.env.JWT_SECRET, {algorithm: 'HS256'});

        const options = {
            method: 'POST',
            host: process.env.TEST_API_GATEWAY_HOST,
            port: process.env.TEST_API_GATEWAY_PORT,
            protocol: process.env.TEST_API_PROTOCOL,
            path: (process.env.TEST_API_GATEWAY_PORT == 443) ? '/dev/v1/users' : '/v1/users',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const httpLib = (options.protocol === 'https:') ? https : http;

        const req = httpLib.request(options, function (res) {
            var data = [];

            res.on('data', function (chunk) {
                data.push(chunk);
            });

            res.on('end', function () {
                var result = Buffer.concat(data);
                console.log('Response code: ' + res.statusCode);
                console.log('Response: ' + result.toString());

                // assert 200 response
                assert.equal(400, res.statusCode);

                done();
            });
            res.on('error', function (err) {
                console.log("error", err);
                done(err);
            });
        });
        req.on('error', function (err) {
            console.log("error", err);
            done(err);
        });
        req.write(JSON.stringify(postData));
        req.end();
    }).timeout(10000);

    it('should POST to /v1/users and return success response 200', function (done) {
        const clientId = '1111';
        const postData = {
            user: {
                firstName: 'Dorian',
                lastName: 'Smiley',
                email: 'doriansmiley@somehwere.com',
                username: 'dsmiley',
                password: 'password'
            }
        };

        const token = jwt.sign({clientId: clientId}, process.env.JWT_SECRET, {algorithm: 'HS256'});

        const options = {
            method: 'POST',
            host: process.env.TEST_API_GATEWAY_HOST,
            port: process.env.TEST_API_GATEWAY_PORT,
            protocol: process.env.TEST_API_PROTOCOL,
            path: (process.env.TEST_API_GATEWAY_PORT == 443) ? '/dev/v1/users' : '/v1/users',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const httpLib = (options.protocol === 'https:') ? https : http;

        const req = httpLib.request(options, function (res) {
            var data = [];

            res.on('data', function (chunk) {
                data.push(chunk);
            });

            res.on('end', function () {
                var result = Buffer.concat(data);
                console.log('Response code: ' + res.statusCode);
                console.log('Response: ' + result.toString());

                // assert 200 response
                assert.equal(200, res.statusCode);

                // parse result data
                let parsedResult = JSON.parse(result.toString());
                // TODO: add full property checks
                expect(parsedResult.user.id > 0 ).to.equal(true);
                expect(parsedResult.user.firstName).to.equal('Dorian');
                expect(parsedResult.user.lastName).to.equal('Smiley');

                done();
            });
            res.on('error', function (err) {
                console.log("error", err);
                done(err);
            });
        });
        req.on('error', function (err) {
            console.log("error", err);
            done(err);
        });
        req.write(JSON.stringify(postData));
        req.end();
    }).timeout(10000);

    // TODO: add tests for 4xx and 5xx errors
});