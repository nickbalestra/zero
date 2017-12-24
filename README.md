# zero
A passwordless inspired strategy for passport

## REPO IS 🚧 

### API

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
