const DATE_FORMAT = require('../constants/date.js').DATE_FORMAT;
const React = require('react');
const moment = require('moment');

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

module.exports = Table;
