'use strict';
const DATE_FORMAT = require('../constants/date.js').DATE_FORMAT;
const debug = require('debug')('influx-query');
const http = require('../http.js');
const formStore = require('../stores/formStore.js');
const moment = require('moment');
const resultsStore = require('../stores/resultsStore.js');

function loadMeasurements() {
  return http.get('influx/measurements')
  .then(measurements => {
    formStore.set('measurements', measurements);
    formStore.set('measurement', measurements[0]);
  });
}

function sendQuery(query) {
  debug('query:', query);
  query = encodeURIComponent(query);
  return http.get('influx/query?q=' + query)
  .then(results => {
    resultsStore.set('results', results);
    return results;
  });
}

function query() {
  let date = moment(formStore.get('datetime'));
  let startDate = moment(date).utc().format(DATE_FORMAT);
  let offset = formStore.get('offset');
  let unit = formStore.get('unit');
  let endDate = moment(date).add(offset, unit).utc().format(DATE_FORMAT);
  let m = formStore.get('measurement');
  let condition = formStore.get('condition');

  let query = 'select * from "' + m + '" where time >= \'' + startDate + '\'' +
    ' and time < \'' + endDate + '\'';
  if (condition) {
    query += 'and ' + condition;
  }

  return sendQuery(query);
}

module.exports = { loadMeasurements, query };
