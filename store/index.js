// Escolhe o banco pelo ambiente: com MONGODB_URI usa o MongoDB Atlas, sem ela usa o SQLite local.
const path = require('path');

module.exports = function createStore() {
  if (process.env.MONGODB_URI) return require('./mongo')(process.env.MONGODB_URI, process.env.MONGODB_DB);
  return require('./sqlite')(process.env.DATA_DIR || path.join(__dirname, '..', 'data'));
};
