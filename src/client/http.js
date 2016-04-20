'use strict';
const debug = require('debug')('influx-query');
const http = require('axios');
const statusStore = require('./stores/statusStore.js');

function get(url) {
  debug('==> GET ' + url);
  statusStore.set('status', {
    type: 'info',
    message: 'Loading...'
  });
  return http.get(url)
  .then(response => {
    debug('<== ' + response.status);
    statusStore.set('status', undefined);
    return response.data;
  })
  .catch(_err => {
    debug(_err.stack);
    let err = _err;
    if (!(_err instanceof Error)) {
      let message = _err.data && _err.data.message || 'An error has occurred';
      err = new Error(message);
      err.data = _err.data;
      err.status = _err.status || 500;
    }
    statusStore.set('status', {
      type: 'error',
      message: err && err.message || 'An error has occurred'
    });
    throw err;
  });
}

module.exports = { get };
