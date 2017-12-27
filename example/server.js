'use strict';

require('dotenv').config();

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const expressSession = require('express-session');
const es6Renderer = require('express-es6-template-engine');
const { ensureLoggedIn } = require('connect-ensure-login');
const passport = require('passport');
const { Strategy, email } = require('passport-zero');
const db = require('./db');

// Configure the zero strategy for use by Passport, baisc config shown.
// For advanced configurations and options, check the docs
//
// The zero strategy requires:
// - An async `verify` function which receives the credentials
// (email address in case of the default email deliver) submitted by the user.
// The function must verify that the email is correct and then return a promise with a user object,
// which will be sent via email as link, once clicked the token content will be decoded and set at `req.user` in route handlers.
// - A secret used to sign tokens
// - A deliver module. You can use the bundled email helper to easily configure an email deliver
passport.use(
  new Strategy(
    {
      secret: 'zero cat',
      deliver: email({
        // Change yours data here
        // Or create a .env file with the following variables
        // For further information on smtp cofngurtion check https://github.com/eleith/emailjs
        user: process.env.smtpServerUser,
        from: process.env.smtpServerFrom,
        password: process.env.smtpServerPassword,
        port: process.env.smtpServerPort,
        host: process.env.smtpServerHost,
        ssl: true
      })
    },
    email => db.users.findByEmail(email)
  )
);

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  const user = await db.users.findById(id);
  cb(null, user);
});

// Create a new Express application.
const app = express();

// Configure view engine to render ES6 templates.
app.engine('html', es6Renderer);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(logger('combined'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  expressSession({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
  })
);

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get(
  '/login/:message?',
  (req, res) =>
    req.params.message ? res.render('message') : res.render('login')
);

app.post(
  '/auth/zero',
  passport.authenticate('zero', {
    action: 'requestToken',
    failureRedirect: '/login'
  }),
  (req, res) => res.redirect('/login/message')
);

app.get(
  '/',
  passport.authenticate('zero', { failureRedirect: '/' }),
  (req, res) => (req.user ? res.redirect('/profile') : res.render('home'))
);

app.get('/profile', ensureLoggedIn(), (req, res) =>
  res.render('profile', { locals: { user: req.user } })
);

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.listen(3000);
