'use strict';
const React = require('react');
const statusStore = require('../stores/statusStore.js');

const Status = React.createClass({
  getInitialState() {
    return statusStore.getState();
  },
  componentDidMount() {
    statusStore.addListener(this.onChange);
  },
  componentWillUnmout() {
    statusStore.removeListener(this.onChange);
  },
  onChange() {
    this.setState(statusStore.getState());
  },
  render() {
    let status = statusStore.get('status');
    let style = { display: status ? 'inherit' : 'none' };
    status = status || { type: '', message: '' };

    let className = ['status', status.type].join(' ');

    return (
      <div className={className} style={style}>{status.message}</div>
    );
  }
});

module.exports = Status;
