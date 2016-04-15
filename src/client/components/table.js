const _ = require('underscore');
const DATE_FORMAT = require('../constants/date.js').DATE_FORMAT;
const React = require('react');
const actions = require('../actions/formActions.js');
const moment = require('moment');
const tagsStore = require('../stores/tagsStore.js');

function addCondition(key, value) {
  actions.addCondition(key, '=', value);
}

function Table(props) {
  var data = props.data || [];
  if (!data.length) return <div>{'No data'}</div>;

  var tags = tagsStore.get('tags');
  var keys = Object.keys(data[0]);
  var ths = keys.map((key, i) => {
    let title = key;
    if (key in tags) {
      let options = _.map(tags[key], (tag, i) => {
        return <option key={i} value={tag}>{tag}</option>;
      });
      title = (
        <select
          onChange={(e) => addCondition(key, e.target.value)}
          value="<ALL>"
        >
          <option value="<ALL>">{key}</option>
          {options}
        </select>
      );
    }

    return (
      <th key={i}>
        {title}
      </th>
    );
  });

  var trs = data.map((result, i) => {
    var tds = keys.map((key, j) => {
      let value, handleClick;
      if (key === 'time') {
        value = moment(result[key]).format(DATE_FORMAT);
        handleClick = () => actions.setDate(value);
      } else {
        value = result[key];
        handleClick = () => addCondition(key, result[key]);
      }


      return (
        <td
          key={j}
        >
          {value}
          &nbsp;
          <i aria-hidden="true" className="fa fa-filter clickable"
            onClick={handleClick}
          ></i>
        </td>
      );
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
