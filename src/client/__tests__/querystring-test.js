'use strict';
jest.unmock('../querystring.js');

const query = require('../querystring.js');
const history = require('../window/history.js');
const location = require('../window/location.js');

describe('query', () => {

  beforeEach(() => {
    history.pushState.mockClear();
  });

  describe('getQuery', () => {

    it('should parse current window.location.search', () => {
      location.getSearch.mockReturnValue('?a=1&b=2');

      let q = query.getQuery();

      expect(q).toEqual({ a: '1', b: '2' });
    });

    it('should return empty object when no search', () => {

      location.getSearch.mockReturnValue('');

      let q = query.getQuery();

      expect(q).toEqual({});
    });

  });

  describe('setQuery', () => {

    it('should push history state', () => {
      query.setQuery({ a: 1, b: 2 });
      expect(history.pushState.mock.calls).toEqual([[ '?a=1&b=2' ]]);
    });

    it('should not history state when empty', () => {
      query.setQuery({});
      expect(history.pushState.mock.calls).toEqual([[ '' ]]);
    });

  });

});
