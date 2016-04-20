const createStore = require('./store.js').createStore;

let store = createStore();
store.set('condition', '');
store.set('query', '');

module.exports = store;
