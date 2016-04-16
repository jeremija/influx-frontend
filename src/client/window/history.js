const history = window.history || {};

function pushState(query) {
  return history && history.pushState(undefined, '', query);
}

module.exports = { pushState };
