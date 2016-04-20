'use strict';
const DATE_FORMAT = require('../constants/date.js').DATE_FORMAT;
const React = require('react');
const actions = require('../actions/formActions.js');
const formStore = require('../stores/formStore.js');
const moment = require('moment');

var units = ['minute', 'hour', 'day'];

function getMeasurements(measurement) {
  let measurements = formStore.get('measurements') || [];
  if (measurements.indexOf(measurement) < 0) measurement = measurements[0];
  return {
    measurements,
    measurement
  };
}

const Form = React.createClass({
  getInitialState() {
    let measurements = getMeasurements();
    return {
      condition: '',
      measurements: measurements.measurements,
      measurement: measurements.measurement,
      unit: 'hour',
      datetime: moment(Date.now() - 1 * 3600000).format(DATE_FORMAT),
      offset: 1,
    };
  },
  componentDidMount() {
    formStore.addListener(this.onChange);
  },
  componentWillUnmount() {
    formStore.addListener(this.onChange);
  },
  setMeasurement(e) {
    this.setState({ measurement: e.target.value });
  },
  setDateTime(e) {
    this.setState({ datetime: e.target.value });
  },
  setOffset(e) {
    this.setState({ offset: e.target.value });
  },
  setUnit(e) {
    this.setState({ unit: e.target.value });
  },
  setCondition: function(e) {
    this.setState({ condition: e.target.value });
  },
  onChange() {
    this.setState(getMeasurements(this.state.measurement));
  },
  handleSubmit: function(e) {
    e.preventDefault();

    let condition = this.state.condition;
    let datetime = this.state.datetime;
    let m = this.state.measurement;
    let unit = this.state.unit;
    let offset = this.state.offset;
    let startDate = moment(datetime).utc().format(DATE_FORMAT);
    let endDate = moment(datetime).add(offset, unit).utc().format(DATE_FORMAT);

    let query = 'select * from "' + m + '" where time >= \'' +
      startDate + '\' and time < \'' + endDate + '\'';

    if (condition) {
      query += ' ' + condition;
    }

    actions.query(query);
  },
  render() {
    let measurements = this.state.measurements;
    let measurementOpts = measurements.map((measurement, i) => {
      return <option key={i}>{measurement}</option>;
    });

    let unitOpts = units.map((unit, i) => {
      return <option key={i}>{unit}</option>;
    });

    return (
      <form className="query" onSubmit={this.handleSubmit}>
        <select name="measurement" onChange={this.setMeasurement}>
          {measurementOpts}
        </select>
        <input
          name="datetime"
          onChange={this.setDateTime}
          required
          type="datetime"
          value={this.state.datetime}
        />
        <input
          max="8"
          min="1"
          name="offset"
          onChange={this.setOffset}
          required
          type="number"
          value={this.state.offset}
        />
        <select
          name="unit"
          onChange={this.setUnit}
          value={this.state.unit}
        >
          {unitOpts}
        </select>

        <div className="right">
          <input
            className="condition"
            name="condition"
            onChange={this.setCondition}
            type="text"
            value={this.state.condition}
          />
          <input type="submit" value="Go" />
        </div>
      </form>
    );
  }
});

module.exports = Form;
