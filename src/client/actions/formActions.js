'use strict';
const Bluebird = require('bluebird');
const DATE_FORMAT = require('../constants/date.js').DATE_FORMAT;
const debug = require('debug')('influx-query');
const http = require('../http.js');
const formStore = require('../stores/formStore.js');
const moment = require('moment');
const resultsStore = require('../stores/resultsStore.js');
const tagsStore = require('../stores/tagsStore.js');

let tagsCache = {};

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
  return http.get('influx/measurements')
  .then(measurements => {
    formStore.set('measurements', measurements);
    formStore.set('measurement', measurements[0]);
  });
}

function loadTags(measurement) {
  if (tagsCache[measurement]) return Bluebird.resolve(tagsCache[measurement]);
  return http.get('influx/' + measurement + '/tags')
  .then(tags => {
    tagsCache[measurement] = tags;
    tagsStore.set('tags', tags);
    return tags;
  });
}

function sendQuery(measurement, query) {
  debug('query:', query);
  query = encodeURIComponent(query);

  let _results;
  return http.get('influx/query?q=' + query)
  .then(results => (_results = results))
  .then(() => loadTags(measurement))
  .then(tags => {
    tagsStore.set('tags', tags);
    resultsStore.set('results', _results);
    return _results;
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
    query += ' ' + condition;
  }

  return sendQuery(m, query);
}

module.exports = { addCondition, loadMeasurements, query, setDate };
