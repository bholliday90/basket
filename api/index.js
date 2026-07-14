const { query } = require('../backend/db');

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  // Vercel rewrite changes req.url to /api
  // Read original URL from headers or reconstruct from req
  const originalUrl = req.headers['x-vercel-forwarded-url'] || req.headers['x-original-url'] || req.url;
  const url = new URL(originalUrl, `http://${req.headers.host || 'localhost'}`);
  const path = url.pathname;
  const searchParams = url.searchParams || new URLSearchParams(req.url.split('?')[1] || '');
  
  try {
    if (path === '/api/health' || path === '/health') {
      return res.end(JSON.stringify({ status: 'ok' }));
    }
    if (path === '/api/stores' || path === '/stores') {
      return res.end(JSON.stringify(query('SELECT * FROM stores WHERE active = 1')));
    }
    if (path === '/api/deals' || path === '/deals') {
      const sql = `SELECT p.id as product_id, p.name as product_name, p.category, p.unit, p.image_url, pr.price, pr.unit_price, s.name as store_name, s.url as store_url FROM products p JOIN (SELECT product_id, MIN(price) as min_price FROM prices GROUP BY product_id) min_prices ON p.id = min_prices.product_id JOIN prices pr ON p.id = pr.product_id AND pr.price = min_prices.min_price JOIN stores s ON pr.store_id = s.id LIMIT 10`;
      return res.end(JSON.stringify(query(sql)));
    }
    if (path === '/api/categories' || path === '/categories') {
      const results = query('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category ASC');
      return res.end(JSON.stringify(results.map(r => r.category)));
    }
    if (path.includes('/products/search')) {
      const q = searchParams.get('q') || '';
      const store = searchParams.get('store') || '';
      let sql = `SELECT p.id as product_id, p.name as product_name, p.category, p.unit, p.image_url, pr.price, pr.unit_price, pr.fetched_at, s.name as store_name, s.slug as store_slug, s.url as store_url FROM products p JOIN prices pr ON p.id = pr.product_id JOIN stores s ON pr.store_id = s.id WHERE p.name LIKE '%${q.replace(/'/g, "''")}%'`;
      if (store) sql += ` AND s.slug = '${store.replace(/'/g, "''")}'`;
      sql += ' ORDER BY pr.price ASC';
      return res.end(JSON.stringify(query(sql)));
    }
    if (path.startsWith('/api/products/') || path.startsWith('/products/')) {
      const id = path.split('/').pop();
      const sql = `SELECT pr.*, s.name as store_name, s.slug as store_slug, s.url as store_url FROM prices pr JOIN stores s ON pr.store_id = s.id WHERE pr.product_id = '${id.replace(/'/g, "''")}' ORDER BY pr.price ASC`;
      return res.end(JSON.stringify(query(sql)));
    }
    
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found', path, originalUrl }));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message }));
  }
};