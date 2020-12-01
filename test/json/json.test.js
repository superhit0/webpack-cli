'use strict';
const { run } = require('../utils/test-utils');
const rimraf = require('rimraf');
const { stat, readFile } = require('fs');
const { resolve, join } = require('path');

const successMessage = 'stats are successfully stored as json to stats.json';

describe('json flag', () => {
    beforeEach((done) => {
        rimraf(join(__dirname, './stats.json'), () => {
            done();
        });
    });

    it('should return valid json', () => {
        const { exitCode, stderr, stdout } = run(__dirname, ['--json']);

        expect(() => JSON.parse(stdout)).not.toThrow();
        expect(exitCode).toBe(0);
        expect(stderr).toBeFalsy();
        expect(JSON.parse(stdout)['hash']).toBeDefined();
    });

    it('should store json to a file', (done) => {
        const { exitCode, stderr, stdout } = run(__dirname, ['--json', 'stats.json']);

        expect(stderr).toBeFalsy();
        expect(stdout).toContain(successMessage);
        expect(exitCode).toBe(0);

        stat(resolve(__dirname, './stats.json'), (err, stats) => {
            expect(err).toBe(null);
            expect(stats.isFile()).toBe(true);

            readFile(resolve(__dirname, 'stats.json'), 'utf-8', (err, data) => {
                expect(err).toBe(null);
                expect(JSON.parse(data)['hash']).toBeTruthy();
                expect(JSON.parse(data)['version']).toBeTruthy();
                expect(JSON.parse(data)['time']).toBeTruthy();
                expect(() => JSON.parse(data)).not.toThrow();
                done();
            });
        });
    });

    it('should store json to a file and respect --color flag', (done) => {
        const { exitCode, stderr, stdout } = run(__dirname, ['--json', 'stats.json', '--color']);

        expect(stdout).toContain(`[webpack-cli] \u001b[32m${successMessage}`);
        expect(exitCode).toBe(0);
        expect(stderr).toBeFalsy();

        stat(resolve(__dirname, './stats.json'), (err, stats) => {
            expect(err).toBe(null);
            expect(stats.isFile()).toBe(true);

            readFile(resolve(__dirname, 'stats.json'), 'utf-8', (err, data) => {
                expect(err).toBe(null);
                expect(JSON.parse(data)['hash']).toBeTruthy();
                expect(JSON.parse(data)['version']).toBeTruthy();
                expect(JSON.parse(data)['time']).toBeTruthy();
                expect(() => JSON.parse(data)).not.toThrow();
                done();
            });
        });
    });

    it('should store json to a file and respect --no-color', (done) => {
        const { exitCode, stderr, stdout } = run(__dirname, ['--json', 'stats.json', '--no-color']);

        expect(stdout).not.toContain(`[webpack-cli] \u001b[32m${successMessage}`);
        expect(stdout).toContain(`[webpack-cli] ${successMessage}`);
        expect(exitCode).toBe(0);
        expect(stderr).toBeFalsy();

        stat(resolve(__dirname, './stats.json'), (err, stats) => {
            expect(err).toBe(null);
            expect(stats.isFile()).toBe(true);
            readFile(resolve(__dirname, 'stats.json'), 'utf-8', (err, data) => {
                expect(err).toBe(null);
                expect(JSON.parse(data)['hash']).toBeTruthy();
                expect(JSON.parse(data)['version']).toBeTruthy();
                expect(JSON.parse(data)['time']).toBeTruthy();
                expect(() => JSON.parse(data)).not.toThrow();
                done();
            });
        });
    });

    it('should warn the user if stats file already exist', (done) => {
        let { exitCode, stderr, stdout } = run(__dirname, ['--json', 'compilation-stats.json']);

        expect(stderr).toBeFalsy();
        expect(stdout).toContain('stats are successfully stored as json to compilation-stats.json');
        expect(exitCode).toBe(0);

        // run 2nd compilation
        ({ exitCode, stderr, stdout } = run(__dirname, ['--json', 'compilation-stats.json']));

        expect(stderr).toContain(`file 'compilation-stats.json' already exists and will be overwritten.`);
        expect(stdout).toContain('stats are successfully stored as json to compilation-stats.json');
        expect(exitCode).toBe(0);

        stat(resolve(__dirname, './compilation-stats.json'), (err, stats) => {
            expect(err).toBe(null);
            expect(stats.isFile()).toBe(true);

            readFile(resolve(__dirname, './compilation-stats.json'), 'utf-8', (err, data) => {
                expect(err).toBe(null);
                expect(JSON.parse(data)['hash']).toBeTruthy();
                expect(JSON.parse(data)['version']).toBeTruthy();
                expect(JSON.parse(data)['time']).toBeTruthy();
                expect(() => JSON.parse(data)).not.toThrow();
                done();
            });
        });
    });

    it('should return valid json with -j alias', () => {
        const { exitCode, stderr, stdout } = run(__dirname, ['-j']);

        expect(exitCode).toBe(0);
        expect(stderr).toBeFalsy();
        expect(() => JSON.parse(stdout)).not.toThrow();
        expect(JSON.parse(stdout)['hash']).toBeDefined();
    });
});
