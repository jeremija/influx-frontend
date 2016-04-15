const createStore = require('./store.js').createStore;

let store = createStore();
store.set('tags', {});

module.exports = store;
