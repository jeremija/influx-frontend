const createStore = require('./store.js').createStore;

let store = createStore();
store.set('condition', '');

module.exports = store;
