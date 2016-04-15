'use strict';
const app = require('../../src/server/app.js');
const expect = require('chai').expect;
const influx = require('../../src/server/influx.js');
const request = require('supertest-as-promised');

describe('app', () => {

  before(() => {
    return influx.writePointAsync(
      'test',
      { a: 1, b: 2 },
      { t1: 'tag1', t2: 'tag2' }
    )
    .then(() => {
      return influx.writePointAsync(
        'test',
        { a: 2, b: 3 },
        { t1: 'tag1', t2: 'tag3' }
      );
    });

  });

  describe('GET /influx/query', () => {

    it('should return json from influx', () => {

      return request(app)
      .get('/influx/query?q=show+measurements')
      .expect(200)
      .then(res => {
        expect(res.body).to.be.an('array');
        expect(res.body[0]).to.be.an('array');
        expect(res.body[0].some(m => m.name === 'test')).to.be.ok;
      });

    });

  });

  describe('GET /influx/measurements', () => {

    it('should return json from influx', () => {
       return request(app)
       .get('/influx/measurements')
       .expect(200)
       .then(res => {
         expect(res.body).to.be.an('array');
         expect(res.body.some(m => m === 'test')).to.be.ok;
       });
    });

  });

  describe('GET /influx/:measurement/tags', () => {

    it('should merge tags\' keys and values', () => {
      return request(app)
      .get('/influx/test/tags')
      .expect(200)
      .then(res => {
        expect(res.body).to.be.an('object');
        expect(res.body).to.eql({ t1: ['tag1'], t2: ['tag2', 'tag3'] });
      });
    });

  });

});
