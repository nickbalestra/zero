'use strict';

const jwt = require('jsonwebtoken');
const { promisify } = require('../utils/promise');
const lookup = require('../utils/lookup');

const acceptToken = async (strategy, req, options) => {
  // Get token from tokenField
  const tokenField = strategy.deliver.tokenField;
  const token = options.allowPost
    ? lookup(req.body, tokenField) || lookup(req.query, tokenField)
    : lookup(req.query, tokenField);

  if (!token) {
    // Pass without making a success or fail decision (No passport user will be set)
    // https://github.com/jaredhanson/passport/blob/master/lib/middleware/authenticate.js#L329
    // Next middleware can check req.user object
    return strategy.pass();
  }

  // Verify token
  const verifyToken = promisify(jwt.verify);
  const { user, ...tokenInfo } = jwt
    .verify(token, strategy.secret)
    .catch(err => strategy.error(err));

  // Dont Allow reuse
  const allowReuse = options.allowReuse || false;
  if (!allowReuse) {
    // Get used tokens from tokenStorage
    const usedTokens = await strategy.tokenStorage.get(user.id);
    if (usedTokens[token]) {
      return strategy.fail(
        {
          message: options.tokenAlreadyUsedMessage || `Token was already used`
        },
        400
      );
    }

    // Revoke the token
    // If you using a persistent tokenStorage you might want to
    // regularly prune expired tokens (No need to revoke already expired tokens)
    usedTokens[token] = tokenInfo.exp;
    await strategy.tokenStorage.set(user.id, usedTokens);
  }

  // Pass setting a passport user
  // Next middleware can check req.user object
  return strategy.success(user);
};

module.exports = acceptToken;
