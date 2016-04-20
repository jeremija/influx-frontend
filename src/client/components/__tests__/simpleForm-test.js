'use strict';
jest.unmock('../simpleForm.js');
jest.unmock('../../stores/store.js');

const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');

const SimpleForm = require('../simpleForm.js');
const actions = require('../../actions/formActions.js');
const formStore = require('../../stores/formStore.js');

let store = {};
formStore.get.mockImplementation(key => store[key]);
formStore.set.mockImplementation((k, v) => (store[k] = v));
formStore.getState.mockImplementation(() => store);

describe('form', () => {

  beforeEach(() => {
    store = {};
    actions.query.mockClear();
    formStore.set.mockClear();
    formStore.get.mockClear();
  });

  function render(component) {
    let rendered = TestUtils.renderIntoDocument(<div>{component}</div>);
    return ReactDOM.findDOMNode(rendered);
  }

  it('should render input elements', () => {
    let node = render(<SimpleForm />);
    expect(node.querySelectorAll('input').length).toBe(4);
  });

  function setValue(node, value) {
    node.value = value;
    TestUtils.Simulate.change(node);
  }

  it('should change store values typing', () => {
    formStore.set('measurements', ['app-logs']);
    formStore.set('condition', 'and 1 = 1');
    let form = render(<SimpleForm />);
    setValue(form.querySelector('input[name=datetime]'), '2016-01-02');
    setValue(form.querySelector('select[name=unit]'), 'hour');
    setValue(form.querySelector('select[name=measurement]'), 'app-logs');

    let event = { preventDefault: jest.genMockFunction() };
    TestUtils.Simulate.submit(form.querySelector('form'), event);

    expect(event.preventDefault.mock.calls.length).toBe(1);
    expect(actions.query.mock.calls.length).toBe(1);
    expect(actions.query.mock.calls[0][0]).toMatch(
      new RegExp([
        "^select \\* from \"app-logs\" where time >= '2016-01.*?' ",
        "and time < '2016-01.*?' and 1 = 1$"
      ].join(''))
    );
  });

});
