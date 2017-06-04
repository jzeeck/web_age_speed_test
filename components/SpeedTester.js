// Private
const WebPageTest = require('webpagetest');
const webTestPageUrl =  'www.webpagetest.org';
const sleep = require('sleep');

/** Logging */
const winston = require('winston');
winston.level = 'info';

var WebPageTestClass = null;

// Public
module.exports = WebPageSpeedTester;

function WebPageSpeedTester(apiKey) {
    WebPageTestClass = new WebPageTest(webTestPageUrl, apiKey);
}

WebPageSpeedTester.prototype.startTest = function(pageUrl, location) {

  var returnValue;

  WebPageTestClass.runTest(
    pageUrl, {location: location}, 
    (err, data) => {
        if (err) {
          winston.log('error', 'Failed to run test for page with URL %s.', pageUrl);
          winston.log('error', err);
          returnValue = false;
        }
        // TODO (zeeck): Should check statusText if request was okay.
        // Other wise return false and report error.
        returnValue = data['data']['testId'];
      }
  );

  while(returnValue === undefined) {
    require('deasync').runLoopOnce();
  }
  return returnValue; 
};

WebPageSpeedTester.prototype.waitForTestToComplete = function(testId) {
  winston.log('debug', 'Started waiting for test %s to complete.', testId);
  var status = WebPageSpeedTester.prototype.getStatus(testId);

  while(status['statusCode'] != 200) {

    if(status['statusCode'] == 500) {
      winston.log('error', 'Fatal error when waiting for test to complete.');
      return false;
    } else if(status['statusCode'] == 100) {
      winston.log('debug', 'Test started, waiting 40 seconds for it to complete.');
      sleep.sleep(40);
    } else if(status['statusCode'] == 101) {
      winston.log('info', 
        'Waiting for test to start. There are %s test infront of the queue.',
        status['behindCount']);
      winston.log('info', 'Sleeping %s seconds', 40 * (1 + status['behindCount']));
      sleep.sleep(40 * (1 + status['behindCount']));
    }
    status = WebPageSpeedTester.prototype.getStatus(testId);
  }
  winston.log('debug', 'Completed waiting for test %s to complete.', testId);
  return true;
};

WebPageSpeedTester.prototype.getStatus = function(testId) {

  var statusCode;
  var behindCount;

  WebPageTestClass.getTestStatus(
    testId,
    (err, data) => {
      if (err) {
        winston.log('error', err || data);
        statusCode = 500;
      }
      statusCode = parseInt(data['statusCode']);
      if (statusCode == 101) {
        behindCount = parseInt(data['data']['behindCount'])
      }
      if (statusCode == 100) {
        behindCount = 0;
      }
    }
  );

  while(statusCode === undefined) {
    require('deasync').runLoopOnce();
  }

  const returnValue = {
    'statusCode'  : statusCode,
    'behindCount' : behindCount
  }
  return returnValue;
};

WebPageSpeedTester.prototype.getTestResults = function(testId) {
  var returnValue;

  WebPageTestClass.getTestResults(
    testId,
    (err, data) => {
      winston.log('debug', err || data);
      returnValue = data;
    }
  );

  while(returnValue === undefined) {
    require('deasync').runLoopOnce();
  }
  return returnValue; 
};
