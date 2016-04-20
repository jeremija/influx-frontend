const React = require('react');
const formStore = require('../stores/formStore.js');
const actions = require('../actions/formActions.js');

const Form = React.createClass({
  getInitialState() {
    return { query: formStore.get('query') };
  },
  componentDidMount() {
    formStore.addListener(this.onChange);
  },
  componentWillUnmount() {
    formStore.removeListener(this.onChange);
  },
  onChange() {
    this.setState(formStore.getState());
  },
  setQuery(e) {
    formStore.set('query', e.target.value);
  },
  submit(e) {
    e.preventDefault();
    actions.query(formStore.get('query'));
  },
  render() {
    return (
      <form className="query" onSubmit={this.submit}>
        <div className="right">
          <input
            className="condition"
            onChange={this.setQuery}
            type="text"
            value={formStore.get('query')}
          />
          <input type="submit" value="Go" />
        </div>
      </form>
    );
  }
});

module.exports = Form;
