const Strategy = require('../lib/Strategy.js');

test('strategy name', () => {
  const strategy = new Strategy(
    {
      deliver: {},
      secret: 'very-secret'
    },
    () => {}
  );
  expect(strategy.name).toBe('zero');
});

test('should throw if constructed without a verify callback', () => {
  // expect(new Strategy()).toBe('')
  // expect(function() {
  //   var s = new Strategy();
  // }).to.throw(TypeError, 'LocalStrategy requires a verify callback');
});
