const React = require('react');
const formStore = require('../stores/formStore.js');
const actions = require('../actions/formActions.js');

var units = ['minute', 'hour', 'day'];

function handleSubmit(e) {
  e.preventDefault();
  actions.query();
}

const Form = React.createClass({
  getInitialState() {
    return formStore.getState();
  },
  componentDidMount() {
    formStore.addListener(this.onChange);
  },
  componentWillUnmount() {
    formStore.removeListener(this.onChange);
  },
  onChange() {
    this.setState(formStore.getState());
  },
  render() {
    let measurements = formStore.get('measurements') || [];
    let measurementOpts = measurements.map((measurement, i) => {
      return <option key={i}>{measurement}</option>;
    });

    let unitOpts = units.map((unit, i) => {
      return <option key={i}>{unit}</option>;
    });

    return (
      <form className="query" onSubmit={handleSubmit}>
        <select onChange={e => formStore.set('measurement', e.target.value)}>
          {measurementOpts}
        </select>
        <input
          onChange={e => formStore.set('datetime', e.target.value)}
          required
          type="datetime"
          value={formStore.get('datetime')}
        />
        <input
          max="8"
          min="1"
          onChange={e => formStore.set('offset', e.target.value)}
          required
          type="number"
          value={formStore.get('offset')}
        />
        <select
          onChange={e => formStore.set('unit', e.target.value)}
          value={formStore.get('unit')}
        >
          {unitOpts}
        </select>

        <div className="right">
          <input
            className="condition"
            onChange={e => formStore.set('condition', e.target.value)}
            type="text"
            value={formStore.get('condition')}
          />
          <input type="submit" value="Go" />
        </div>
      </form>
    );
  }
});

module.exports = Form;
