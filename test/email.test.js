const email = require('../lib/email');

// TODO: mock emoiljs
// - test if email is sent correctly
// - test template
// - test overriding from and to in the template as well
const deliver = email({
  // template: (user, token, request) => ({
  //   to: user.email,
  //   subject: `Hello ${user.name}!`,
  //   text: 'Welcome!'
  // }),
  from: 'from@someone.com',
  user: 'to@someone.com',
  password: 'secure',
  host: 'smtp.this-smtp-server-deoesntexist.com',
  port: '465'
});

test('deliver: API', () => {
  expect(deliver.addressField).toBe('email');
  expect(deliver.send).toBeInstanceOf(Function);
});

test('deliver: send method', async () => {
  try {
    await deliver.send(
      { name: 'nick', email: 'nick@balestra.ch' },
      '123.123.123',
      { hostname: 'localhost', protocol: 'http' }
    );
  } catch (err) {
    expect(err.toString()).toMatch('ENOTFOUND');
  }
});
