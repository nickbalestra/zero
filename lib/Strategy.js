'use strict';

const jwt = require('jsonwebtoken');

const tokenStorage = require('./tokenStorage');
const lookup = require('./utils/lookup');

class Strategy {
  constructor(
    {
      storage = tokenStorage, // default: In-memory storage
      ttl = 60 * 60 * 24 * 7, // default: 7Days
      tokenField = 'token', // default: 'token'
      secret,
      deliver
    },
    verify
  ) {
    if (!deliver) {
      throw new Error('ZeroStrategy requires a deliver module');
    }
    if (!secret) {
      throw new Error('ZeroStrategy requires a secret to sign tokens');
    }
    if (!verify) {
      throw new Error('ZeroStrategy requires a function to verify users');
    }
    this.name = 'zero';
    this.storage = storage;
    this.ttl = ttl;
    this.tokenField = tokenField;
    this.secret = secret;
    this.deliver = deliver;
    this.verify = verify;
  }

  authenticate(req, options = {}) {
    const action = options.action || 'acceptToken';
    const allowPost = options.allowPost || true;

    // Request token logic
    // =====================================
    if (options.action === 'requestToken') {
      // Get address from addressField
      // Default addressField: 'email'
      const address = allowPost
        ? lookup(req.body, this.deliver.addressField) ||
          lookup(req.query, this.deliver.addressField)
        : lookup(req.query, this.deliver.addressField);

      if (!address) {
        return this.error('NO_ADDRESS_FOUND');
      }

      // Get payload to encode
      const user = this.verify(address).catch(err => this.fail(err));

      // Generate JWT
      // TODO: promisify jwt.sign
      const token = jwt.sign(user, this.secret, { expiresIn: this.ttl });

      // Deliver JWT
      this.deliver.send(address, token, req).catch(err => this.error(err));

      // Pass without making a success or fail decision
      // https://github.com/jaredhanson/passport/blob/master/lib/middleware/authenticate.js#L329
      return this.pass();
    }

    // Accept token logic
    // =====================================
    if (options.action === 'requestToken') {
      const allowReuse = options.allowReuse || false;

      const token = allowPost
        ? lookup(req.query, this.tokenField) ||
          lookup(req.body, this.tokenField)
        : lookup(req.query, this.tokenField);

      if (!token) {
        // Pass without making a success or fail decision
        // https://github.com/jaredhanson/passport/blob/master/lib/middleware/authenticate.js#L329
        return this.pass();
      }

      // Verify token
      // TODO: promisify jwt.sign
      const user = jwt.verify(token, this.secret);
      if (!allowReuse) {
        // We check after verifying as there is no need to store expired tokens
        // Check if token is in storage
        // if not add it and OK
        // else return error "ALREADY USED"
      }
      return this.success(user);
    }

    return this.error('UNKNOWN_ACTION');
  }
}

module.exports = Strategy;
