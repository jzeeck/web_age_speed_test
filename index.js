const WebPageSpeedTester = require('./components/SpeedTester');
const Locations = require('./components/Locations');
const Result = require('./components/Result');
const sleep = require('sleep');
const moment = require('moment');

/** Logging. */
const winston = require('winston');
winston.level = 'info'; // Set log level! Should be in conf?

/** Timestamp when this is run started. */
const now = moment();
const timestamp = now.format('YYYY-MM-DD HH:mm:ss Z');

/** Configuration needed to run this program. */
const config = require('./config.json');

const apiKey = config.apiKey;

/** Check if apiKey is set. */
if (apiKey == undefined || typeof apiKey !== 'string' ) {
    winston.log('error', 'Missing apiKey in config root. Or value is not a string');
    process.exit(-1);
}

const urls = config.urls;
if (!(urls instanceof Array)) {
    winston.log('error', 'Urls in the config needs to be of the type Array.');
    process.exit(-1);
}
urls.forEach(function(url) {
    if (url == undefined || typeof url !== 'string' ) {
        winston.log('error', 'One of the urls is not a string.');
        process.exit(-1);
    }
});


const tester = new WebPageSpeedTester(apiKey);
const locations = new Locations();

/** 
 * Start doing actual work.
 * 
 * Initally start all the tests requested and store their Ids in an array.
 */
winston.log('info', 'Starting speed test at: %s', timestamp);

const runs = [];
urls.forEach(function(url) {
    locations.getKeys().forEach(function(location) {

        winston.log('info', 'Starting test for url: %s from %s.', url, location);
        const testId = tester.startTest(url, locations.getLocation(location));

        const run = {
            'id'  : testId,
            'url' : url,
            'location' : location,
        }

        if (testId) {
            winston.log('debug', run);
            runs.push(run);
        } else {
            winston.log('warn', 
                'Failed to start test for url: %s from location: %s.',
                url,
                location);
        }
    });
});

/**
 * Sanity check. If no tests were started abort.
 */
if (runs.length == 0) {
    winston.log('error', 'No test were started. Aborting probram.');
    process.exit(-1);
}

winston.log('debug', 'Following test runs were created: [%s]', runs);

/**
 * Waiting for tests to complete...
 */
winston.log('info', 'Waiting for tests to complete...');

var results = {'timestamp': timestamp};
var testResults = [];


runs.forEach(function(run) {

    var success = tester.waitForTestToComplete(run['id']);
    winston.log('info', run);

    if (success) {
        winston.log('debug', 'Test with id: %s was successful.', run['id']);
        const testResult = tester.getTestResults(run['id']);
        const firstView = testResult['data']['runs']['1']['firstView'];
        const repeatView = testResult['data']['runs']['1']['repeatView'];

        const result =
            new Result(run['url'], firstView, repeatView, run['location']);
        testResults.push(result);

    } else {
        winston.log('warn', 'Test with id: %s had fatal failure.', run['id']);
    }
});

results['results'] = testResults;

/** Log the results just FYI */
results['results'].forEach(function(result) {
    console.log(result.getMetrics());
    
});

