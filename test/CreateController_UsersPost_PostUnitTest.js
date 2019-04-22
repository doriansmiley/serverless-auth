'use strict';
//must occur first!!! Our client SDK requires global window object and DOM objects
// @IMPORTANT: allows us to include the MFour Client SDK for tests
let globalFunction = require('../Globals.js');
globalFunction();
const http = require('http');
const https = require('https');
const assert = require('assert');
const jwt = require('jsonwebtoken');
const fs = require("fs");

describe('Testing service routes', function() {
    // TODO: refactor these tests once business logic is implemented in your controllers
    const tmpValues = {
        tmp: 'someValue'
    };

    const jsonArtifact = JSON.stringify(tmpValues);

    it('should POST to /v1/users/sessions and return success response 200', function(done) {
        const clientId = '1111';
        const postData = {
            clientId: clientId,
            tmpValues: jsonArtifact
        };

        const token = jwt.sign({ clientId: clientId }, process.env.JWT_SECRET, { algorithm: 'HS256'});

        const options = {
            method: 'POST',
            host: process.env.TEST_API_GATEWAY_HOST,
            port: process.env.TEST_API_GATEWAY_PORT,
            path: (process.env.TEST_API_GATEWAY_PORT == 443) ? '/dev/v1/users/sessions' : '/v1/users/sessions',
            headers: {
                'Content-Type' : 'application/json'
            }
        };
        console.log('###################################### ' + options.path)
        const httpLib = (options.protocol === 'https:') ? https : http;

        const req = httpLib.request(options, function (res) {
            let data = [];

            res.on('data', function (chunk) {
                data.push(chunk);
            });

            res.on('end', function () {
                let result = Buffer.concat(data);
                console.log('Response headers: ' + JSON.stringify(res.headers));
                console.log('res.req.headers: ' + res.req.headers);
                console.log('Response code: ' + res.statusCode);
                console.log('options.host: ' + options.host);
                console.log('options.port: ' + options.port);
                console.log('options.path: ' + options.path);
                console.log('Response: ' + result.toString());

                // assert 200 response
                assert.equal(200, res.statusCode);

                // parse result data
                let parsedResult = JSON.parse(result.toString());
                // TODO: add assertions when API is done
                expect(parsedResult).to.deep.equal({tmp: "someValue"});

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
