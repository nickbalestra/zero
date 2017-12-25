const chai = require('chai');
chai.use(require('chai-passport-strategy'));
const { passport } = chai;

const email = require('../lib/email');
const Strategy = require('../lib/Strategy');
const strategy = new Strategy(
  {
    secret: 'top-secret',
    deliver: email({})
    // deliver: {
    //   addressField: "email",
    //   async send(user, token, request) {
    //     setTimeout(() => {
    //       return "done";
    //     }, 200);
    //   }
    // }
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

test('handling a request with valid credentials in body', done => {
  passport
    .use(strategy)
    .pass(result => {
      expect(result.message).toBe('Token succesfully sent');
      done();
    })
    .req(req => {
      req.body = {};
      req.body.email = 'user@domain.com';
    })
    .authenticate({ action: 'requestToken' });
});

test('handling a request with valid credentials in query', done => {
  passport
    .use(strategy)
    .pass(result => {
      expect(result.message).toBe('Token succesfully sent');
      done();
    })
    .req(req => {
      req.query = {};
      req.query.email = 'user@domain.com';
    })
    .authenticate({ action: 'requestToken' });
});

test('handling a request with valid missing credentials in body', done => {
  passport
    .use(strategy)
    .fail(result => {
      expect(result.message).toBe('Missing email');
      done();
    })
    .req(req => {
      req.body = {};
    })
    .authenticate({ action: 'requestToken' });
});

test('handling a request with valid missing credentials in query', done => {
  passport
    .use(strategy)
    .fail(result => {
      expect(result.message).toBe('Missing email');
      done();
    })
    .req(req => {
      req.body = {};
      req.body.email = 'user@domain.com';
      req.query = {};
    })
    .authenticate({ action: 'requestToken', allowPost: false });
});
