const React = require('react');
const formStore = require('../stores/formStore.js');

const SimpleForm = require('./simpleForm.js');
const RawForm = require('./rawForm.js');

let stateStyles = {
  raw: {
    raw: { display: 'inherit' },
    simple: { display: 'none' }
  },
  simple: {
    raw: { display: 'none', },
    simple: { display: 'inherit' }
  }
};

function getButtonState(state, targetState) {
  return state === targetState ? 'active' : '';
}

function getState() {
  return {
    display: formStore.get('display')
  };
}

function showSimpleForm() {
  formStore.set('display', 'simple');
}

function showRawForm() {
  formStore.set('display', 'raw');
}

const Form = React.createClass({
  getInitialState() {
    return getState();
  },
  componentDidMount() {
    formStore.addListener(this.onChange);
  },
  componentWillUnmount() {
    formStore.removeListener(this.onChange);
  },
  onChange() {
    this.setState(getState());
  },
  render() {
    let state = this.state.display || 'simple';
    let styles = stateStyles[state];

    return (
      <div className="form">
        <div className="form-display-switcher">
          <button
            className={getButtonState(state, 'simple')}
            onClick={showSimpleForm}
          >
            Simple
          </button>
          <button
            className={getButtonState(state, 'raw')}
            onClick={showRawForm}
          >
            Raw
          </button>
        </div>

        <div style={styles.simple}>
          <SimpleForm />
        </div>

        <div style={styles.raw} >
          <RawForm />
        </div>
      </div>
    );
  }
});

module.exports = Form;
