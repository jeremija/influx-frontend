'use strict';
const app = require('../../src/server/app.js');
const expect = require('chai').expect;
const influx = require('../../src/server/influx.js');
const request = require('supertest-as-promised');

describe('app', () => {

  before(() => {
    return influx.queryAsync('create database logs')
    .then(() => {
      return influx.writePointAsync(
        'test',
        { a: 1, b: 2 },
        { t1: 'tag1', t2: 'tag2' }
      );
    })
    .then(() => {
      return influx.writePointAsync(
        'test',
        { a: 2, b: 3 },
        { t1: 'tag1', t2: 'tag3' }
      );
    });

  });

  function login(username, password) {
    return request(app)
    .post('/login')
    .send('username=' + username + '&password=' + password);
  }

  function getSessionCookie() {
    return login('admin', '4dm1n')
    .expect(302)
    .then(res => {
      expect(res.headers['location']).to.equal('/');
      let cookie = res.headers['set-cookie'];
      return cookie;
    });
  }

  describe('POST /login', () => {
    it('should set session cookie', () => {
      return getSessionCookie()
      .then(cookie => {
        expect(cookie).to.be.ok;
        return request(app)
        .get('/')
        .set('cookie', cookie)
        .expect(200);
      });
    });

    it('should return 401 when invalid username', () => {
      return login('wrong user', 'wrong password')
      .expect(401);
    });

    it('should return 401 when invalid password ', () => {
      return login('admin', 'wrong password')
      .expect(401);
    });

  });

  describe('GET /influx/query', () => {

    it('should not be available when not authenticated', () => {
       return request(app)
       .get('/influx/measurements')
       .expect(302);
    });

    it('should return json from influx', () => {

      return getSessionCookie()
      .then(cookie => {
        return request(app)
        .get('/influx/query?q=show+measurements')
        .set('cookie', cookie)
        .expect(200)
        .then(res => {
          expect(res.body).to.be.an('array');
          expect(res.body[0]).to.be.an('array');
          expect(res.body[0].some(m => m.name === 'test')).to.be.ok;
        });

      });

    });

  });

  describe('GET /influx/measurements', () => {

    it('should not be available when not authenticated', () => {
       return request(app)
       .get('/influx/measurements')
       .expect(302);
    });

    it('should return json from influx', () => {
      return getSessionCookie()
      .then(cookie => {
         return request(app)
         .get('/influx/measurements')
         .set('cookie', cookie)
         .expect(200)
         .then(res => {
           expect(res.body).to.be.an('array');
           expect(res.body.some(m => m === 'test')).to.be.ok;
         });
      });
    });

  });

  describe('GET /influx/:measurement/tags', () => {

    it('should not be available when not authenticated', () => {
       return request(app)
       .get('/influx/measurements')
       .expect(302);
    });

    it('should merge tags\' keys and values', () => {
      return getSessionCookie()
      .then(cookie => {
         return request(app)
         .get('/influx/test/tags')
         .set('cookie', cookie)
         .expect(200)
         .then(res => {
           expect(res.body).to.be.an('object');
           expect(res.body).to.eql({ t1: ['tag1'], t2: ['tag2', 'tag3'] });
         });
      });
    });

  });

});
