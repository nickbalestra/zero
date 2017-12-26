const jwt = require('jsonwebtoken');
const { passport: testPassport } = require('chai').use(
  require('chai-passport-strategy')
);

const email = require('../lib/deliver');
const Strategy = require('../lib/Strategy');

const strategy = new Strategy(
  {
    secret: 'top-secret',
    deliver: email({})
  },
  async address =>
    new Promise((resolve, reject) => {
      if (address === 'user@domain.com') {
        setTimeout(
          resolve({
            email: 'user@domain.com',
            id: 111
          }),
          200
        );
      }
      reject('USER_NOT_FOUND');
    })
);

const user = { email: 'user@domain.com', id: 111 };
const validIat = secsAgo => Math.floor(Date.now() / 1000) - secsAgo;

test('handling a request with valid token in body', done => {
  const token = jwt.sign({ user }, strategy.secret, {
    expiresIn: strategy.ttl
  });

  testPassport
    .use(strategy)
    .success(user => {
      expect(user).toEqual(user);
      done();
    })
    .req(req => {
      req.body = {
        token
      };
    })
    .authenticate({ action: 'acceptToken', allowReuse: true });
});

test('handling a request with valid token in query', done => {
  const token = jwt.sign({ user }, strategy.secret, {
    expiresIn: strategy.ttl
  });

  testPassport
    .use(strategy)
    .success(user => {
      expect(user).toEqual(user);
      done();
    })
    .req(req => {
      req.query = {
        token
      };
    })
    .authenticate({
      action: 'acceptToken',
      allowPost: false,
      allowReuse: true
    });
});

test('handling a request with missing token in query', done => {
  const token = jwt.sign({ user }, strategy.secret, {
    expiresIn: strategy.ttl
  });

  testPassport
    .use(strategy)
    .pass(info => {
      expect(info.message).toBe('No token found in token');
      done();
    })
    .req(req => {
      req.query = {};
    })
    .authenticate({ action: 'acceptToken', allowPost: false });
});

test('handling a request with missing token in body', done => {
  const token = jwt.sign({ user }, strategy.secret, {
    expiresIn: strategy.ttl
  });

  testPassport
    .use(strategy)
    .pass(info => {
      expect(info.message).toBe('No token found in token');
      done();
    })
    .req(req => {
      req.body = {};
    })
    .authenticate({ action: 'acceptToken', allowPost: true });
});

test('handling a request with expired token in body', done => {
  const token = jwt.sign({ user, iat: validIat(60) }, strategy.secret, {
    expiresIn: 30
  });
  testPassport
    .use(strategy)
    .error(result => {
      expect(result.message).toBe('jwt expired');
      done();
    })
    .req(req => {
      req.body = {
        token
      };
    })
    .authenticate({ action: 'acceptToken', allowPost: true });
});

test('handling a request with revoked token (already used) in body', done => {
  const token = jwt.sign({ user }, strategy.secret, {
    expiresIn: strategy.ttl
  });

  testPassport
    .use(strategy)
    .success(user => {
      expect(user).toEqual(user);
      testPassport
        .use(strategy)
        .fail(info => {
          expect(info.message).toBe('Token was already used');
          done();
        })
        .req(req => {
          req.body = {
            token
          };
        })
        .authenticate({ action: 'acceptToken', allowReuse: false });
    })
    .req(req => {
      req.body = {
        token
      };
    })
    .authenticate({
      /* defaults: action: 'acceptToken', allowReuse: false */
    });
});

test('handling uknkown authenticate action', done => {
  testPassport
    .use(strategy)
    .error(error => {
      expect(error.message).toBe('Unknown action');
      done();
    })
    .req(req => {
      req.body = {};
    })
    .authenticate({ action: 'unknown' });
});
