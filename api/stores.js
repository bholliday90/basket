const { query } = require('../backend/db');

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const stores = query('SELECT * FROM stores WHERE active = 1');
    res.end(JSON.stringify(stores));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message }));
  }
};