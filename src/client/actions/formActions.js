'use strict';
const Bluebird = require('bluebird');
const debug = require('debug')('influx-query');
const http = require('../http.js');
const formStore = require('../stores/formStore.js');
const resultsStore = require('../stores/resultsStore.js');
const querystring = require('../querystring.js');
const tagsStore = require('../stores/tagsStore.js');

let tagsCache = {};

function noop() {}

function setDate(date) {
  formStore.set('datetime', date);
}

function addCondition(key, comparator, value) {
  let condition = ' and ' + key + ' ' + comparator + ' \'' + value + '\'';
  debug('adding condition: %s', condition);

  formStore
  .set('condition', formStore.get('condition') + condition);
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
  .catch(noop);
}

function loadTags(measurement) {
  if (tagsCache[measurement]) return Bluebird.resolve(tagsCache[measurement]);
  return http.get('api/influx/' + measurement + '/tags')
  .then(tags => {
    tagsCache[measurement] = tags;
    tagsStore.set('tags', tags);
    return tags;
  })
  .catch(noop);
}

function getMeasurement(query) {
  let match = query && query.match(/from *?"(.*?)"/i);
  return match && match[1];
}

function sendQuery(query) {
  debug('query: %s', query);
  let measurement = getMeasurement(query);
  query = encodeURIComponent(query);

  let _results;
  return http.get('api/influx/query?q=' + query)
  .then(results => (_results = results))
  .then(() => {
    if (!measurement) return {};
    return loadTags(measurement);
  })
  .then(tags => {
    tagsStore.set('tags', tags);
    resultsStore.set('results', _results);
    return _results;
  })
  .catch(noop);
}

function query(query) {
  querystring.setQuery({
    display: 'raw',
    query
  });
  formStore.set('query', query);

  return sendQuery(query);
}

module.exports = { addCondition, loadMeasurements, query, setDate };
