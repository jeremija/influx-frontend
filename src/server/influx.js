'use strict';
const Bluebird = require('bluebird');
const config = require('config');
const influx = require('influx');

const influxClient = Bluebird.promisifyAll(influx(config.get('influx')));

module.exports = influxClient;
