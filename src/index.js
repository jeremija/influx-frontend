'use strict';
if (!process.env.DEBUG) {
  process.env.DEBUG = 'influx-query';
}

const app = require('./server/app.js');
const config = require('config');
const debug = require('debug')('influx-query');
const http = require('http');
const https = require('https');

const port = process.env.PORT || 3000;

let server;
if (config.has('ssl.key') && config.has('ssl.crt')) {
  server = https.createServer({
    key: config.get('ssl.key'),
    cert: config.get('ssl.crt')
  }, app);
} else {
  server = http.createServer(app);
}

server.listen(port, () => {
  debug('Listening on port %s', port);
});
