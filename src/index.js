if (!process.env.DEBUG) {
  process.env.DEBUG = 'influx-query';
}

const app = require('./server/app.js');
const debug = require('debug')('influx-query');

const port = process.env.PORT || 3000;

app.listen(port, () => {
  debug('Listening on port %s', port);
});
