const { query } = require('../backend/db');
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const results = query('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category ASC');
    const categories = results.map(r => r.category);
    res.end(JSON.stringify(categories));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message }));
  }
};
