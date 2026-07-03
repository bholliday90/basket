const { query } = require('../../backend/db');
const url = require('url');
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { q, store } = url.parse(req.url, true).query;
  
  if (!q) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: 'Search query (q) is required' }));
  }

  try {
    let sql = `
      SELECT 
        p.id as product_id, 
        p.name as product_name, 
        p.category, 
        p.unit, 
        p.image_url,
        pr.price, 
        pr.unit_price, 
        pr.fetched_at,
        s.name as store_name, 
        s.slug as store_slug,
        s.url as store_url
      FROM products p
      JOIN prices pr ON p.id = pr.product_id
      JOIN stores s ON pr.store_id = s.id
      WHERE p.name LIKE '%${q.replace(/'/g, "''")}%'
    `;

    if (store) {
      sql += ` AND s.slug = '${store.replace(/'/g, "''")}'`;
    }

    sql += ` ORDER BY pr.price ASC`;

    const results = query(sql);
    res.end(JSON.stringify(results));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message }));
  }
};
