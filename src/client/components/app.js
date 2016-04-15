const React = require('react');
const Table = require('./table.js');
const Form = require('./form.js');
const resultsStore = require('../stores/resultsStore.js');

function App() {
  var results = resultsStore.get('results') || [];
  var tables = results.map((data, i) => {
    return <Table data={data} key={i} />;
  });

  return (
    <div>
      <Form />
      {tables}
    </div>
  );
}
