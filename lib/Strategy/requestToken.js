'use strict';

const jwt = require('jsonwebtoken');
const { promisify } = require('../utils/promise');
const lookup = require('../utils/lookup');

const requestToken = async (strategy, req, options) => {
  // Get address from addressField
  const addressField = strategy.deliver.addressField;
  const address = options.allowPost
    ? lookup(req.body, addressField) || lookup(req.query, addressField)
    : lookup(req.query, addressField);

  if (!address) {
    return strategy.fail(
      { message: options.badRequestMessage || `Missing ${addressField}` },
      400
    );
  }

  // Verify user
  const user = await strategy.verify(address).catch(err => strategy.fail(err));

  // Generate JWT
  const createToken = promisify(jwt.sign);
  const token = await createToken({ user }, strategy.secret, {
    expiresIn: strategy.ttl
  }).catch(err => strategy.error(err));

  // Deliver JWT
  await strategy.deliver
    .send(address, token, req)
    .catch(err => strategy.error(err));

  // Pass without making a success or fail decision (No passport user will be set)
  // https://github.com/jaredhanson/passport/blob/master/lib/middleware/authenticate.js#L329
  return strategy.pass({ message: 'Token succesfully delivered' });
};

module.exports = requestToken;
