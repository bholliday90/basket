const url = require('url');
const { query } = require('../backend/db');

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  const parsed = url.parse(req.url, true);
  const path = parsed.query._path || '/';
  
  try {
    if (path === '/health') {
      return res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    }
    if (path === '/stores') {
      const stores = query('SELECT * FROM stores WHERE active = 1');
      return res.end(JSON.stringify(stores));
    }
    if (path === '/deals') {
      const sql = `SELECT p.id as product_id, p.name as product_name, p.category, p.unit, p.image_url, pr.price, pr.unit_price, s.name as store_name, s.url as store_url FROM products p JOIN (SELECT product_id, MIN(price) as min_price FROM prices GROUP BY product_id) min_prices ON p.id = min_prices.product_id JOIN prices pr ON p.id = pr.product_id AND pr.price = min_prices.min_price JOIN stores s ON pr.store_id = s.id LIMIT 10`;
      const deals = query(sql);
      return res.end(JSON.stringify(deals));
    }
    if (path === '/categories') {
      const results = query('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category ASC');
      return res.end(JSON.stringify(results.map(r => r.category)));
    }
    if (path.startsWith('/products/search')) {
      const q = parsed.query.q || '';
      const store = parsed.query.store || '';
      let sql = `SELECT p.id as product_id, p.name as product_name, p.category, p.unit, p.image_url, pr.price, pr.unit_price, pr.fetched_at, s.name as store_name, s.slug as store_slug, s.url as store_url FROM products p JOIN prices pr ON p.id = pr.product_id JOIN stores s ON pr.store_id = s.id WHERE p.name LIKE '%${q.replace(/'/g, "''")}%'`;
      if (store) sql += ` AND s.slug = '${store.replace(/'/g, "''")}'`;
      sql += ' ORDER BY pr.price ASC';
      const results = query(sql);
      return res.end(JSON.stringify(results));
    }
    if (path.startsWith('/products/')) {
      const id = path.replace('/products/', '');
      const sql = `SELECT pr.*, s.name as store_name, s.slug as store_slug, s.url as store_url FROM prices pr JOIN stores s ON pr.store_id = s.id WHERE pr.product_id = '${id.replace(/'/g, "''")}' ORDER BY pr.price ASC`;
      const prices = query(sql);
      return res.end(JSON.stringify(prices));
    }
    if (path.startsWith('/compare')) {
      const ids = parsed.query.ids || '';
      const idList = ids.split(',').map(id => `'${id.replace(/'/g, "''")}'`).join(',');
      const sql = `SELECT pr.*, p.name as product_name, p.unit as product_unit, s.name as store_name, s.slug as store_slug, s.url as store_url FROM prices pr JOIN stores s ON pr.store_id = s.id JOIN products p ON pr.product_id = p.id WHERE pr.product_id IN (${idList}) ORDER BY pr.product_id, pr.price ASC`;
      const results = query(sql);
      return res.end(JSON.stringify(results));
    }
    if (path.startsWith('/affiliate/')) {
      const parts = path.split('/');
      const store = parts[2];
      const productId = parts[3];
      const originalUrl = parsed.query.url || '';
      const affiliateLink = originalUrl;
      return res.end(JSON.stringify({ affiliateUrl: affiliateLink }));
    }
    
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found', path }));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message }));
  }
};
