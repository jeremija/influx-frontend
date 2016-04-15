const debug = require('debug')('influx-query');
const EventEmitter = require('events').EventEmitter;
const React = require('react');
const ReactDOM = require('react-dom');
const moment = require('moment');
const http = require('axios');

const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
var units = ['minute', 'hour', 'day'];

function createStore() {
  var emitter = new EventEmitter();
  var vars = {
    datetime: moment(Date.now() - 2 * 60 * 1000).format(DATE_FORMAT),
    offset: 2,
    unit: 'minute'
  };

  function set(key, value) {
    vars[key] = value;
    emitter.emit('change');
  }

  function get(key) {
    return vars[key];
  }

  function addListener(callback) {
    emitter.on('change', callback);
  }

  function removeListener(callback) {
    emitter.removeListener('change', callback);
  }

  return { set, get, addListener, removeListener };
}

var formStore = createStore();
var resultsStore = createStore();

function get(url) {
  return http.get(url)
  .then(response => response.data)
  .catch(err => {
    debug(err.stack);
    throw err;
  });
}

function loadMeasurements() {
  get('influx/measurements')
  .then(measurements => {
    formStore.set('measurements', measurements);
    formStore.set('measurement', measurements[0]);
  });
}

function sendQuery(query) {
  debug('query:', query);
  query = encodeURIComponent(query);
  get('influx/query?q=' + query)
  .then(results => {
    resultsStore.set('results', results);
  });
}

function submit() {
  var date = moment(formStore.get('datetime'));
  var startDate = moment(date).utc().format(DATE_FORMAT);
  var offset = formStore.get('offset');
  var unit = formStore.get('unit');
  var endDate = moment(date).add(offset, unit).utc().format(DATE_FORMAT);
  var m = formStore.get('measurement');
  var condition = formStore.get('condition');

  var query = 'select * from "' + m + '" where time >= \'' + startDate + '\'' +
    ' and time < \'' + endDate + '\'';
  if (condition) {
    query += 'and ' + condition;
  }

  sendQuery(query);
}

function Form() {
  let measurements = formStore.get('measurements') || [];
  let measurementOpts = measurements.map((measurement, i) => {
    return <option key={i}>{measurement}</option>;
  });

  let unitOpts = units.map((unit, i) => {
    return <option key={i}>{unit}</option>;
  });

  return (
    <div className="query">
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
      <select onChange={e => formStore.set('unit', e.target.value)}>
        {unitOpts}
      </select>

      <div className="right">
        <input
          className="condition"
          onChange={e => formStore.set('condition', e.target.value)}
          type="text"
        />
        <input onClick={submit} type="submit" />
      </div>
    </div>
  );
}

function Table(props) {
  var data = props.data || [];
  if (!data.length) return <div>{'No data'}</div>;

  var keys = Object.keys(data[0]);
  var ths = keys.map((key, i) => {
    return <th key={i}>{key}</th>;
  });

  var trs = data.map((result, i) => {
    var tds = keys.map((key, j) => {
      var value = key === 'time' ?
        moment(result[key]).format(DATE_FORMAT) : result[key];
      return <td key={j}>{value}</td>;
    });

    return <tr key={i}>{tds}</tr>;
  });

  return (
    <table>
      <thead>
        <tr>
          {ths}
        </tr>
      </thead>
      <tbody>
        {trs}
      </tbody>
    </table>
  );

}

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

function render() {
  ReactDOM.render(<App />, document.querySelector('#container'));
}

formStore.addListener(render);
resultsStore.addListener(render);

loadMeasurements();
render();
