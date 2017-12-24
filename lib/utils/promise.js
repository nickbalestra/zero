'use strict';
// An internal promisify/all wrapper based on node utils
// To make it easier to switch to 3rd part libraries, ie:
// const { promisifyAll, promisify } = require('bluebird')

const { promisify } = require('util');
const promisifyAll = require('util-promisifyall');

module.exports = {
  promisify,
  promisifyAll
};
