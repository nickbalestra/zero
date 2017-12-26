const Strategy = require('../lib/Strategy.js');
const tokenStorage = require('../lib/tokenStorage');

const deliver = {
  addressField: 'email',
  tokenField: 'token',
  send() {}
};

test('should throw if constructed without a verify callback', () => {
  expect(() => {
    new Strategy({
      secret: 'top-secret',
      deliver
    });
  }).toThrowError('ZeroStrategy requires a verify callback');
});

test('should throw if constructed without a secret', () => {
  expect(() => {
    new Strategy(
      {
        deliver
      },
      () => {}
    );
  }).toThrowError('ZeroStrategy requires a secret');
});

test('should throw if constructed without a deliver', () => {
  expect(() => {
    new Strategy(
      {
        secret: 'top-secret'
      },
      () => {}
    );
  }).toThrowError('ZeroStrategy requires a deliver module');
});

test('should throw if constructed without a valid deliver', () => {
  expect(() => {
    new Strategy(
      {
        secret: 'top-secret',
        deliver: {}
      },
      () => {}
    );
  }).toThrowError('ZeroStrategy requires a valid deliver module');
});

test('strategy defaults', () => {
  let stategy;
  const verify = () => {};
  expect(() => {
    strategy = new Strategy(
      {
        secret: 'top-secret',
        deliver
      },
      verify
    );
  }).not.toThrow();
  expect(strategy.name).toBe('zero');
  expect(strategy.secret).toBe('top-secret');
  expect(strategy.verify).toBe(verify);
  expect(strategy.storage).toBe(tokenStorage);
  expect(strategy.ttl).toBe(604800);
});
