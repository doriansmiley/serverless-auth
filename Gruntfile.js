module.exports = function(grunt) {

    // Add the grunt-mocha-test tasks.
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks("grunt-tslint");

    grunt.initConfig({
        // configure linter
        tslint: {
            options: {
                // can be a configuration object or a filepath to tslint.json
                configuration: "tslint.json",
                // If set to true, tslint errors will be reported, but not fail the task
                // If set to false, tslint errors will be reported, and the task will fail
                force: true,
                fix: false
            },
            files: {
                src: [
                    "src/controllers/**/*.ts",
                    "src/core/**/*.ts",
                    "src/dao/**/*.ts",
                    "src/error/**/*.ts",
                    "src/model/**/*.ts",
                    "src/util/**/*.ts",
                ]
            }
        },
        // Configure a mochaTest task
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    timeout: 30000,
                    //captureFile: 'results.txt', // Optionally capture the reporter output to a file
                    quiet: false, // Optionally suppress output to standard out (defaults to false)
                    clearRequireCache: true, // Optionally clear the require cache before running tests (defaults to false)
                    // add jasmine + karma methods in case we need to run client side tests server side
                    require: function () {
                        var chai = require('chai');
                        chai.Assertion.addMethod('toBe', function (expected) {
                            return this.equal(expected);
                        });
                        chai.Assertion.addMethod("toBeDefined", function () {
                            return this.not.undefined;
                        });
                        chai.Assertion.addMethod("toBeUndefined", function () {
                            return this.undefined;
                        });
                        chai.Assertion.addMethod("toBeTruthy", function () {
                            return this.ok;
                        });
                        chai.Assertion.addMethod("toBeCloseTo", function (expected, precision) {
                            precision = precision !== undefined ? precision : 2;
                            var delta = (Math.pow(10, -precision) / 2);
                            this.assert(
                                Math.abs(expected - this._obj) < delta
                                , 'expected #{this} to be close to ' + expected + ' +/- ' + delta
                                , 'expected #{this} not to be close to ' + expected + ' +/- ' + delta
                            );
                        });
                        expect = chai.expect;
                        jasmine = {};
                    }
                },
                src: [
                    'test/**/*Test.js',
                    '!test/integration/*'
                ]
            },
            integrationTest: {
                options: {
                    reporter: 'spec',
                    timeout: 30000,
                    //captureFile: 'results.txt', // Optionally capture the reporter output to a file
                    quiet: false, // Optionally suppress output to standard out (defaults to false)
                    clearRequireCache: true, // Optionally clear the require cache before running tests (defaults to false)
                    // add jasmine + karma methods in case we need to run client side tests server side
                    require: function () {
                        var chai = require('chai');
                        chai.Assertion.addMethod('toBe', function (expected) {
                            return this.equal(expected);
                        });
                        chai.Assertion.addMethod("toBeDefined", function () {
                            return this.not.undefined;
                        });
                        chai.Assertion.addMethod("toBeUndefined", function () {
                            return this.undefined;
                        });
                        chai.Assertion.addMethod("toBeTruthy", function () {
                            return this.ok;
                        });
                        chai.Assertion.addMethod("toBeCloseTo", function (expected, precision) {
                            precision = precision !== undefined ? precision : 2;
                            var delta = (Math.pow(10, -precision) / 2);
                            this.assert(
                                Math.abs(expected - this._obj) < delta
                                , 'expected #{this} to be close to ' + expected + ' +/- ' + delta
                                , 'expected #{this} not to be close to ' + expected + ' +/- ' + delta
                            );
                        });
                        expect = chai.expect;
                        jasmine = {};
                    }
                },
                src: [
                    'test/integration/ServiceTest.js'
                ]
            }
        }
    });

    grunt.registerTask('default', 'mochaTest');

};
