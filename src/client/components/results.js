'use strict';
const React = require('react');
const Table = require('./table.js');

const resultsStore = require('../stores/resultsStore.js');

const Results = React.createClass({
  getInitialState() {
    return resultsStore.getState();
  },
  componentDidMount() {
    resultsStore.addListener(this.onChange);
  },
  componentWillUnmount() {
    resultsStore.removeListener(this.onChange);
  },
  onChange() {
    this.setState(resultsStore.getState());
  },
  render() {
    let results = this.state.results || [];
    var tables = results.map((data, i) => {
      return <Table data={data} key={i} />;
    });
    return <div>{tables}</div>;
  }
});

module.exports = Results;
