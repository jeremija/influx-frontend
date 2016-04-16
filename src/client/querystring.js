'use strict';
const querystring = require('querystring');
const history = require('./window/history.js');
const location = require('./window/location.js');

function getQuery() {
  let query = location.getSearch();
  if (!query) return {};
  query = query.replace(/^\?/, '');
  let queryObj = querystring.parse(query);
  return queryObj;
}

function setQuery(queryObj) {
  let query = querystring.stringify(queryObj);
  if (query) query = '?' + query;
  history.pushState(query);
}

module.exports = { getQuery, setQuery };
