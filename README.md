Zero
==============

A [passwordless](https://github.com/florianheinemann/passwordless) inspired strategy for [passport](https://github.com/jaredhanson/passport)

[![Build Status](https://travis-ci.org/nickbalestra/zero.svg?branch=master)](https://travis-ci.org/nickbalestra/zero)
[![codecov](https://codecov.io/gh/nickbalestra/zero/branch/master/graph/badge.svg)](https://codecov.io/gh/nickbalestra/zero)


## REPO IS 🚧 

## API

### BASIC

Just an idea for the API (Still Flux)
Basic setup: 

```
const { Strategy, email } = require('passport-zero');

// Register strategy
// strategy(options, verify)
// ===========================================
passport.use(
  new Strategy({              
    secret,
    deliver: email({
      ...smtpConfig
    })                    
  },
  verify
))

// Setup route to request a token
// ===========================================
app.post('/auth/zero',
  passport.authenticate('zero', { action : 'requestToken' }), 
  (req, res) => res.redirect('/check-your-inbox')
);

// Setup passport route to authenticate
// options.action default to 'acceptToken'
// ===========================================
app.get('/', 
  passport.authenticate('zero'),
  (req, res) => {
    if (req.user) {
      res.redirect('/here-you-are');
    }
  }
);
```

### ADVANCED

#### Email deliver
```
const { email } = require('passport-zero');

...
deliver: email({
  ...smtpConfig,
  tokenField: 'acceptToken'  // default: 'token'
  template,                  // default: defaultTemplate
})
...

// template API
(user, token, tokenField, req) => ({
  to,        // default: user.email if not overriden in template
  from,      // default to smtpConfig if not ovverriden
  subject,   // default to 'Token for ${hostname}!'
  text       // default to 'Hello!\nAccess your account here: ${protocol}://${hostname}/?${tokenField}=${token}`
})
```

Custom deliver module API
```
{
  async send(user, token, req){},
  tokenField,
  addressField,
}
```
