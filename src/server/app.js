'use strict';
const LocalStrategy = require('passport-local').Strategy;
const _ = require('underscore');
const bodyParser = require('body-parser');
const browserify = require('browserify-middleware');
const config = require('config');
const debug = require('debug')('influx-query');
const express = require('express');
const influx = require('./influx.js');
const passport = require('passport');
const path = require('path');

const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));

app.use((req, res, next) => {
  let timestamp = Date.now();
  debug('==> %s %s', req.method, req.url);
  req.on('end', () => {
    debug(
      '<== %s %s (%s) %sms',
      req.method, req.url, res.statusCode, Date.now() - timestamp
    );
  });
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: config.get('secret')
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new LocalStrategy((username, password, done) => {
  debug('%s logging in...', username);
  let key = 'users.' + username;
  let user = config.has(key) ? config.get(key) : {};
  if (user.password && user.password === password) {
    user.username = username;
    debug('%s logged in!', username);
    return done(null, user);
  }
  debug('%s failed to log in!', username);
  done();
}));

app.use(express.static(path.join(__dirname, '../static')));

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  // failureRedirect: '/'
}));

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

browserify.settings({
  transform: ['babelify']
});

function handleError(err, res) {
  debug('error: %s', err.stack);
  res.status(500).json({ error: err.message });
}

function ensureLoggedIn(req, res, next) {
  if (req.user) return next();
  return res.redirect('/login');
}

app.use(ensureLoggedIn);

app.get('/influx/query', (req, res) => {
  influx.queryAsync(req.param.database, req.query.q)
  .then(results => res.json(results))
  .catch(err => handleError(err, res));
});

app.get('/influx/measurements', (req, res) => {
  influx.getMeasurementsAsync()
  .then(measurements => {
    measurements = _.flatten(measurements[0].series[0].values);
    res.json(measurements);
  })
  .catch(err => handleError(err, res));
});

app.get('/influx/:measurement/tags', (req, res) => {
  let m = req.params.measurement;
  let tags = {};
  influx.queryAsync('show tag keys from "' + m + '"')
  .then(keys => keys[0].map(k => k.tagKey))
  .mapSeries(key => {
    return influx.queryAsync(
      'show tag values from "' + m + '" with key = "' + key + '"'
    )
    .then(result => (tags[key] = result[0].map(r => r.value)));
  })
  .then(() => res.json(tags))
  .catch(err => handleError(err, res));
});

app.use(
  '/js/index.js', browserify(path.join(__dirname, '../client/index.js'))
);

app.get('/', (req, res) => {
  res.render('index');
});

module.exports = app;
