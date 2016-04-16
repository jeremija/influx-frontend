const React = require('react');
const ReactDOM = require('react-dom');

const App = require('./components/app.js');

const _ = require('underscore');
const actions = require('./actions/formActions.js');
const formStore = require('./stores/formStore.js');
const querystring = require('./querystring.js');

let query = querystring.getQuery();
_.each(query, (value, key) => formStore.set(key, value));

function render() {
  ReactDOM.render(<App />, document.querySelector('#container'));
}

actions.loadMeasurements();
render();
