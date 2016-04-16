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
    change();
    return self;
  }

  function softSet(key, value) {
    vars[key] = value;
    return self;
  }

  function change() {
    emitter.emit('change');
    return self;
  }

  function get(key) {
    return vars[key];
  }

  function getState() {
    return vars;
  }

  function setState(_vars) {
    vars = _vars || {};
  }

  function addListener(callback) {
    emitter.on('change', callback);
    return self;
  }

  function removeListener(callback) {
    emitter.removeListener('change', callback);
    return self;
  }

  function when(key, callback) {
    emitter.on('change', (_key, value) => {
      if (key === _key) callback(value);
    });
    return self;
  }

  let self = {
    addListener,
    change,
    get,
    getState,
    removeListener,
    set,
    setState,
    softSet,
    when
  };
  return self;
}

module.exports = { createStore };
