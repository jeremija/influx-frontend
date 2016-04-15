const EventEmitter = require('events').EventEmitter;
const moment = require('moment');
const DATE_FORMAT = require('../constants/date.js').DATE_FORMAT;

function createStore() {
  var emitter = new EventEmitter();
  var vars = {
    datetime: moment(Date.now() - 2 * 60 * 1000).format(DATE_FORMAT),
    offset: 2,
    unit: 'minute'
  };

  function set(key, value) {
    vars[key] = value;
    emitter.emit('change');
  }

  function get(key) {
    return vars[key];
  }

  function addListener(callback) {
    emitter.on('change', callback);
  }

  function removeListener(callback) {
    emitter.removeListener('change', callback);
  }

  return { set, get, addListener, removeListener };
}

module.exports = { createStore };
