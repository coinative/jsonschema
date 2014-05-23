process.env.NODE_ENV = 'test';

var chai = require('chai');

// Chai chokes when diffing very large arrays
chai.config.showDiff = false;

global.should = chai.should();
