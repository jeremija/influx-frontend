'use strict';
const React = require('react');
const statusStore = require('./stores/statusStore.js');

function Status() {
  let status = statusStore.get('status');
  let display = status ? 'display: inherit;' : 'display: none;';
  status = status || {};

  let className = ['status', status.type].join(' ');

  return (
    <div className={className} style={display}>{status.message}</div>
  );
}

module.exports = Status;
