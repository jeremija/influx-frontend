'use strict';
const debug = require('debug')('influx-query');
const http = require('axios');

function get(url) {
  return http.get(url)
  .then(response => response.data)
  .catch(err => {
    debug(err.stack);
    throw err;
  });
}

module.exports = { get };
