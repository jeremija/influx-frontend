'use strict';
const Bluebird = require('bluebird');
const DATE_FORMAT = require('../constants/date.js').DATE_FORMAT;
const debug = require('debug')('influx-query');
const http = require('../http.js');
const formStore = require('../stores/formStore.js');
const moment = require('moment');
const resultsStore = require('../stores/resultsStore.js');
const querystring = require('../querystring.js');
const statusStore = require('../stores/statusStore.js');
const tagsStore = require('../stores/tagsStore.js');

let tagsCache = {};

function handleError(error) {
  statusStore.set('status', {
    type: 'error',
    message: error && error.message || 'An error has occurred'
  });
}

function removeStatus() {
  statusStore.set('status', undefined);
}

function setDate(date) {
  formStore.set('datetime', date);
}

function addCondition(key, comparator, value) {
  let condition = formStore.get('condition') || '';
  condition += ' and ';
  condition += key + ' ' + comparator + ' \'' + value + '\'';
  debug('setting condition to: %s', condition);
  formStore.set('condition', condition);
}

function loadMeasurements() {
  return http.get('api/influx/measurements')
  .then(measurements => {
    formStore.softSet('measurements', measurements);

    // replace selected measuremenet only if not set
    if (measurements.indexOf(formStore.get('measurement')) < 0) {
      formStore.softSet('measurement', measurements[0]);
    }

    formStore.change();
  })
  .catch(handleError);
}

function loadTags(measurement) {
  if (tagsCache[measurement]) return Bluebird.resolve(tagsCache[measurement]);
  return http.get('api/influx/' + measurement + '/tags')
  .then(tags => {
    tagsCache[measurement] = tags;
    tagsStore.set('tags', tags);
    return tags;
  })
  .catch(handleError);
}

function sendQuery(measurement, query) {
  debug('query: %s', query);
  query = encodeURIComponent(query);

  let _results;
  return http.get('api/influx/query?q=' + query)
  .then(results => (_results = results))
  .then(() => loadTags(measurement))
  .then(tags => {
    tagsStore.set('tags', tags);
    resultsStore.set('results', _results);
    return _results;
  })
  .then(removeStatus)
  .catch(handleError);
}

function query() {
  let datetime = formStore.get('datetime');
  let startDate = moment(datetime).utc().format(DATE_FORMAT);
  let offset = formStore.get('offset');
  let unit = formStore.get('unit');
  let endDate = moment(datetime).add(offset, unit).utc().format(DATE_FORMAT);
  let m = formStore.get('measurement');
  let condition = formStore.get('condition');

  querystring.setQuery({ datetime, offset, unit, measurement: m, condition });

  let query = 'select * from "' + m + '" where time >= \'' + startDate + '\'' +
    ' and time < \'' + endDate + '\'';
  if (condition) {
    query += ' ' + condition;
  }

  statusStore.set('status', { type: 'info', message: 'Loading...' });
  return sendQuery(m, query);
}

module.exports = { addCondition, loadMeasurements, query, setDate };
