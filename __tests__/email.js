const emailjs = require('emailjs');
const email = require('../lib/email');

const smtpConfig = {
  from: 'from@domain.com',
  user: 'user@domain.com',
  password: 'secure',
  host: 'smtp.domain.com',
  port: '465'
};

test('deliver API', () => {
  const deliver = email(smtpConfig);
  expect(deliver.addressField).toBe('email');
  expect(deliver.tokenField).toBe('token');
  expect(deliver.send).toBeInstanceOf(Function);
  expect(deliver.send.length).toBe(3);
});

test('deliver.send()', async () => {
  const deliver = email(smtpConfig);

  const token = '123.123.123';
  const user = { name: 'John', email: 'john@doe.com' };
  const req = { hostname: 'a-domain.com', protocol: 'http' };
  await deliver.send(user, token, req);

  expect(emailjs.__spy.connect).toHaveBeenCalledWith({
    host: 'smtp.domain.com',
    password: 'secure',
    port: '465',
    ssl: true,
    user: 'user@domain.com'
  });
  expect(emailjs.__spy.send.mock.calls[0][0]).toEqual({
    from: 'from@domain.com',
    subject: 'Token for a-domain.com!',
    text:
      'Hello!\nAccess your account here: http://a-domain.com/?token=123.123.123',
    to: 'john@doe.com'
  });
});

test('deliver.send() with custom tokenField', async () => {
  const deliver = email({
    tokenField: 'acceptToken',
    ...smtpConfig
  });

  const token = '123.123.123';
  const user = { name: 'John', email: 'john@doe.com' };
  const req = { hostname: 'a-domain.com', protocol: 'http' };
  await deliver.send(user, token, req);

  expect(emailjs.__spy.connect).toHaveBeenCalledWith({
    host: 'smtp.domain.com',
    password: 'secure',
    port: '465',
    ssl: true,
    user: 'user@domain.com'
  });
  expect(emailjs.__spy.send.mock.calls[0][0]).toEqual({
    from: 'from@domain.com',
    subject: 'Token for a-domain.com!',
    text:
      'Hello!\nAccess your account here: http://a-domain.com/?acceptToken=123.123.123',
    to: 'john@doe.com'
  });
  expect(deliver.tokenField).toBe('acceptToken');
});

test('send with custom template', async () => {
  const customTemplate = ({ user, token, tokenField, req }) => {
    const { hostname, protocol } = req;
    return {
      subject: 'Your token!',
      text: `Click here: ${protocol}://${hostname}/path/?${tokenField}=${token}`
    };
  };

  const deliver = email({
    ...smtpConfig,
    template: customTemplate
  });

  const token = '123.123.123';
  const user = { name: 'John', email: 'john@doe.com' };
  const req = { hostname: 'a-domain.com', protocol: 'http' };
  await deliver.send(user, token, req);

  expect(emailjs.__spy.send.mock.calls[0][0]).toEqual({
    from: 'from@domain.com',
    subject: 'Your token!',
    text: 'Click here: http://a-domain.com/path/?token=123.123.123',
    to: 'john@doe.com'
  });
});
