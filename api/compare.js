const { query } = require('../backend/db');
const url = require('url');
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { ids } = url.parse(req.url, true).query;
  
  if (!ids) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: 'Product IDs (ids) are required' }));
  }

  const idList = ids.split(',').map(id => `'${id.replace(/'/g, "''")}'`).join(',');

  try {
    const sql = `
      SELECT 
        pr.*, 
        p.name as product_name,
        p.unit as product_unit,
        s.name as store_name, 
        s.slug as store_slug,
        s.url as store_url
      FROM prices pr
      JOIN stores s ON pr.store_id = s.id
      JOIN products p ON pr.product_id = p.id
      WHERE pr.product_id IN (${idList})
      ORDER BY pr.product_id, pr.price ASC
    `;
    const results = query(sql);
    res.end(JSON.stringify(results));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message }));
  }
};
