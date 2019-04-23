'use strict';

const http = require('http');
const https = require('https');
const assert = require('assert');
const fs = require("fs");

describe('Testing service routes', function () {
    // TODO: refactor these tests once business logic is implemented in your controllers
    const postData = {
        user: {
            firstName: 'Dorian',
            lastName: 'Smiley',
            email: 'doriansmiley@somehwere.com',
            username: ('testUser'+ Math.random()).replace('.', ''),
            password: 'password'
        }
    };

    const jsonArtifact = JSON.stringify(postData);

    it('should POST to /v1/users and return invalid request 400', function (done) {
        const postData = {};

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
                console.log('Response headers: ' + JSON.stringify(res.headers));

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
    }).timeout(30000);

    it('should POST to /v1/users and return success response 200', function (done) {

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
                console.log('Response headers: ' + JSON.stringify(res.headers));

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
        req.write(jsonArtifact);
        req.end();
    }).timeout(30000);

    it('should POST to /v1/users should return 400 when user already exists', function (done) {

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
                console.log('Response headers: ' + JSON.stringify(res.headers));

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
        req.write(jsonArtifact);
        req.end();
    }).timeout(30000);

    it('should POST to /v1/users/sessions and return 400 bad request response', function(done) {
        const postData = {};

        const options = {
            method: 'POST',
            host: process.env.TEST_API_GATEWAY_HOST,
            port: process.env.TEST_API_GATEWAY_PORT,
            protocol: process.env.TEST_API_PROTOCOL,
            path: (process.env.TEST_API_GATEWAY_PORT == 443) ? '/dev/v1/users/sessions' : '/v1/users/sessions',
            headers: {
                'Content-Type' : 'application/json'
            }
        };

        const httpLib = (options.protocol === 'https:') ? https : http;

        const req = httpLib.request(options, function (res) {
            let data = [];

            res.on('data', function (chunk) {
                data.push(chunk);
            });

            res.on('end', function () {
                let result = Buffer.concat(data);
                console.log('Response code: ' + res.statusCode);
                console.log('Response: ' + result.toString());
                console.log('Response headers: ' + JSON.stringify(res.headers));

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
    }).timeout(30000);

    it('should POST to /v1/users/sessions and return success response 200', function(done) {
        console.log('postData.user.username: ' + postData.user.username);
        const data = {
            user: {
                username: postData.user.username,
                password: 'password'
            }
        };

        const options = {
            method: 'POST',
            host: process.env.TEST_API_GATEWAY_HOST,
            port: process.env.TEST_API_GATEWAY_PORT,
            protocol: process.env.TEST_API_PROTOCOL,
            path: (process.env.TEST_API_GATEWAY_PORT == 443) ? '/dev/v1/users/sessions' : '/v1/users/sessions',
            headers: {
                'Content-Type' : 'application/json'
            }
        };

        const httpLib = (options.protocol === 'https:') ? https : http;

        const req = httpLib.request(options, function (res) {
            let data = [];

            res.on('data', function (chunk) {
                data.push(chunk);
            });

            res.on('end', function () {
                let result = Buffer.concat(data);
                console.log('Response code: ' + res.statusCode);
                console.log('Response: ' + result.toString());
                console.log('Response headers: ' + JSON.stringify(res.headers));

                // assert 200 response
                assert.equal(200, res.statusCode);

                // parse result data
                let parsedResult = JSON.parse(result.toString());
                // TODO: add assertions when API is done

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
        req.write(JSON.stringify(data));
        req.end();
    }).timeout(30000);

    it('should POST to /v1/users/sessions should return 400 with invalid password', function(done) {
        console.log('postData.user.username: ' + postData.user.username);
        const data = {
            user: {
                username: postData.user.username,
                password: 'test'
            }
        };

        const options = {
            method: 'POST',
            host: process.env.TEST_API_GATEWAY_HOST,
            port: process.env.TEST_API_GATEWAY_PORT,
            protocol: process.env.TEST_API_PROTOCOL,
            path: (process.env.TEST_API_GATEWAY_PORT == 443) ? '/dev/v1/users/sessions' : '/v1/users/sessions',
            headers: {
                'Content-Type' : 'application/json'
            }
        };

        const httpLib = (options.protocol === 'https:') ? https : http;

        const req = httpLib.request(options, function (res) {
            let data = [];

            res.on('data', function (chunk) {
                data.push(chunk);
            });

            res.on('end', function () {
                let result = Buffer.concat(data);
                console.log('Response code: ' + res.statusCode);
                console.log('Response: ' + result.toString());
                console.log('Response headers: ' + JSON.stringify(res.headers));

                // assert 200 response
                assert.equal(400, res.statusCode);

                // parse result data
                let parsedResult = JSON.parse(result.toString());
                // TODO: add assertions when API is done

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
        req.write(JSON.stringify(data));
        req.end();
    }).timeout(30000);

    // TODO: add tests for 4xx and 5xx errors
});
