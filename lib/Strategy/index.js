'use strict';

const acceptToken = require('./acceptToken');
const requestToken = require('./requestToken');
const tokenStorage = require('../storage');
const { deliver: validate } = require('../utils/validate');

class Strategy {
  constructor(
    {
      storage = tokenStorage, // default: In-memory storage
      ttl = 60 * 60 * 24 * 7, // default: 7Days
      secret,
      deliver
    },
    verify
  ) {
    if (!deliver) {
      throw new Error('ZeroStrategy requires a deliver module');
    } else if (!validate(deliver)) {
      throw new Error('ZeroStrategy requires a valid deliver module');
    }
    if (!secret) {
      throw new Error('ZeroStrategy requires a secret');
    }
    if (!verify) {
      throw new Error('ZeroStrategy requires a verify callback');
    }
    this.name = 'zero';
    this.storage = storage;
    this.ttl = ttl;
    this.secret = secret;
    this.deliver = deliver;
    this.verify = verify;
  }

  async authenticate(req, options = {}) {
    const sanitizedOptions = {
      action: 'acceptToken',
      allowPost: true,
      ...options
    };

    // Request token logic
    // =====================================
    if (sanitizedOptions.action === 'requestToken') {
      return requestToken(this, req, sanitizedOptions);
    }

    // Accept token logic
    // =====================================
    if (sanitizedOptions.action === 'acceptToken') {
      return acceptToken(this, req, sanitizedOptions);
    }

    return this.error(new Error('Unknown action'));
  }
}

module.exports = Strategy;
