passport-zero
==============

A [passwordless](https://github.com/florianheinemann/passwordless) inspired strategy for [passport](https://github.com/jaredhanson/passport)

[![Build Status](https://travis-ci.org/nickbalestra/zero.svg?branch=master)](https://travis-ci.org/nickbalestra/zero)
[![codecov](https://codecov.io/gh/nickbalestra/zero/branch/master/graph/badge.svg)](https://codecov.io/gh/nickbalestra/zero)

This module allows authentication and authorization without passwords in your Node.js
applications. It works by simply sending one-time password (OTPW) tokens via email (default) or other means. The module was inspired by @florianheinemann 's [passwordless project](https://github.com/florianheinemann/passwordless/). By plugging into Passport, zero authentication can be easily and unobtrusively integrated into any application or framework that supports [Connect](http://www.senchalabs.org/connect/)-style middleware, including [Express](http://expressjs.com/). 

Token-based authentication is...

- Faster to implement compared to typical user auth systems (you only need one form)
- Has a great UX for your users as they get started with your app quickly and don't have to remember passwords
- Can be leveraged for private betas & similar by providing a single way to easily collect prospects 
- More secure for your users avoiding the risks of reused passwords

## Getting you started

The following should provide a quick-start in using zero. If you need more details check out the [example app](https://github.com/nickbalestra/zero/tree/master/example). For anything you feel missing on this readme or on the example don't hesitate to [open issues]((https://github.com/nickbalestra/zero/issues)) with comments and questions.

### Install

```
$ npm install passport-zero
```

### Usage

#### Configure Strategy

The zero authentication strategy authenticates users via a one-time password token sent via email ot other means:

```js
const { Strategy, email } = 'passport-zero';

passport.use(
  new Strategy({              
    secret,
    deliver: email(smtpConfig)                    
  },
  verify
))
```

##### Available Options

This strategy, aside `secret` and `deliver` supports further options:

* `secret` - Mandatory string, used to sign tokens
* `deliver` - mandatory module, used to send tokens. You can use the bundled email helper to easily configure the email delivery.
* `storage` - Optional, defaults to an in-memory storage. You can provide your own, especially for persistency reasons. Its API shuld consist in async `get`, `set`, and `delete` methods all returning promises. [Check the default implementation](https://github.com/nickbalestra/zero/blob/master/lib/deliver/index.js) for reference.
* `ttl` - Optionals, defaults to 7days (in seconds), its used to set the token expiration.

##### Verify function
As a second parameter the constructor requires an async `verify` function which receives the credentials (email address in case of the default email deliver) submitted by the user. The function is in charge of verifying that the email is correct returning a promise with a user object, or false in case no user was found.

#### Authenticate Requests
Use `passport.authenticate()`, specifying the `'zero'` strategy for two actions:

##### request token
In this situation the passport authenticate middleware will check for the correct parameters and send a token via the delivery system in case of success. By default, in the email deliver, it will look for the value 'email' in the body and the query (body can disabled by setting the option `allowPost` to `false`).

```js
app.post('/auth/zero',
  passport.authenticate('zero', { action : 'requestToken' }), 
  (req, res) => res.redirect('/check-your-inbox')
);
```

##### accept token
In this situation (the default) the passport authenticate middleware will check for a token. By default, in the email deliver, it will look for the value 'token' in the body and the query (body can disabled by setting the option `allowPost` to `false`).

```js
app.post('/auth/zero',
  passport.authenticate('zero'), 
  (req, res) => res.redirect('/profile')
);
```

## Examples

Developers using the popular [Express](http://expressjs.com/) web framework can
refer to an [example](https://github.com/nickbalestra/zero/tree/master/example)
as a starting point for their own web applications. For other examples or more advanced passport related feature, check the [passport docs](http://www.passportjs.org/docs/).

## Advanced

### Email deliver
The zero strategy comes with an email deliver configurator, allowing you to get up and running quickly with an email delivery system.

```js
const { email } = require('passport-zero');

...
deliver: email({
  ...smtpConfig,
  ...options
})
...
```

Aside from the mandatory smtp configuration it accept some more options:

* tokenField - Optional, defaults to `token`. The paramater used to look for the token during the acceptToken process and the parameter used to send the token via email. ie: `hostname/?token=...`.
* addressField - Optional, defaults to `email`. Used to define the parameter for the email during the requestToken process.
* template - Optional function , defaults to an internal template. The function need to have the following signature:  `(user, token, tokenField, req) => ({to, from, subject, text})`. 

  * to - Optional, defaults to user.email if not overriden in template
  * from - Optional, defaults to smtpConfig.from if not ovverriden in template
  * subject - Mandatory
  * text - Mandatory

### Custom deliver

If you want to implement your own deliver mechanism (sms, ...), the deliver module should have the following API shape:

```js
{
  async send(user, token, req){},
  tokenField,
  addressField,
}
```
