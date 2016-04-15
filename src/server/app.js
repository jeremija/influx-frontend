'use strict';
const _ = require('underscore');
const browserify = require('browserify-middleware');
const debug = require('debug')('influx-query');
const express = require('express');
const influx = require('./influx.js');
const path = require('path');

const app = express();

browserify.settings({
  transform: ['babelify']
});

function handleError(err, res) {
  debug('error: %s', err.stack);
  res.status(500).json({ error: err.message });
}

app.use((req, res, next) => {
  let timestamp = Date.now();
  debug('==> %s %s', req.method, req.url);
  req.on('end', () => {
    debug(
      '<== %s %s %sms',
      req.method, req.url, res.statusCode, Date.now() - timestamp
    );
  });
  next();
});

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
app.use('/', express.static(path.join(__dirname, '../static')));

module.exports = app;
