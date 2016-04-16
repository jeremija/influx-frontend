const React = require('react');
const Form = require('./form.js');
const Results = require('./results.js');
const Status = require('./status.js');

function App() {
  return (
    <div>
      <Form />
      <Status />
      <Results />
    </div>
  );
}

module.exports = App;
