const React = require('react');
const ReactDOM = require('react-dom');

const Table = require('./components/table.js');
const Form = require('./components/form.js');

const actions = require('./actions/formActions.js');
const formStore = require('./stores/formStore.js');
const resultsStore = require('./stores/resultsStore.js');

function renderForm() {
  ReactDOM.render(<Form />, document.querySelector('#form'));
}

function renderResults() {
  var results = resultsStore.get('results') || [];
  var tables = results.map((data, i) => {
    return <Table data={data} key={i} />;
  });
  ReactDOM.render(<div>{tables}</div>, document.querySelector('#results'));
}

function render() {
  renderForm();
  renderResults();
}

formStore.addListener(renderForm);
resultsStore.addListener(renderResults);

actions.loadMeasurements();
render();
