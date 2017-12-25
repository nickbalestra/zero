'use strict';

const jwt = require('jsonwebtoken');

const tokenStorage = require('./tokenStorage');
const { promisify } = require('./utils/promise');
const lookup = require('./utils/lookup');

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
    const action = options.action || 'acceptToken';
    const allowPost =
      typeof options.allowPost !== 'undefined'
        ? Boolean(options.allowPost)
        : true;

    // Request token logic
    // =====================================
    if (options.action === 'requestToken') {
      // Get address from addressField
      const addressField = this.deliver.addressField;
      const address = allowPost
        ? lookup(req.body, addressField) || lookup(req.query, addressField)
        : lookup(req.query, addressField);

      if (!address) {
        return this.fail(
          { message: options.badRequestMessage || `Missing ${addressField}` },
          400
        );
      }

      // Get payload to encode
      const user = await this.verify(address).catch(err => this.fail(err));

      // Generate JWT
      const createToken = promisify(jwt.sign);
      const token = await createToken(user, this.secret, {
        expiresIn: this.ttl
      }).catch(err => this.error(err));

      // Deliver JWT
      await this.deliver
        .send(address, token, req)
        .catch(err => this.error(err));

      // Pass without making a success or fail decision (We are not yet setting a passport user)
      // https://github.com/jaredhanson/passport/blob/master/lib/middleware/authenticate.js#L329
      return this.pass({ message: 'Token succesfully sent' });
    }

    // Accept token logic
    // =====================================
    if (options.action === 'acceptToken') {
      const allowReuse = options.allowReuse || false;

      const token = allowPost
        ? lookup(req.body, this.tokenField) ||
          lookup(req.query, this.tokenField)
        : lookup(req.query, this.tokenField);

      if (!token) {
        // Pass without making a success or fail decision
        // https://github.com/jaredhanson/passport/blob/master/lib/middleware/authenticate.js#L329
        // Next middleware can check req.user object
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
