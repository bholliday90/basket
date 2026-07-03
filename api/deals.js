const { query } = require('../backend/db');
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const sql = `
      SELECT 
        p.id as product_id, 
        p.name as product_name, 
        p.category, 
        p.unit, 
        p.image_url,
        pr.price, 
        pr.unit_price, 
        s.name as store_name,
        s.url as store_url
      FROM products p
      JOIN (
        SELECT product_id, MIN(price) as min_price
        FROM prices
        GROUP BY product_id
      ) min_prices ON p.id = min_prices.product_id
      JOIN prices pr ON p.id = pr.product_id AND pr.price = min_prices.min_price
      JOIN stores s ON pr.store_id = s.id
      LIMIT 10
    `;
    const deals = query(sql);
    res.end(JSON.stringify(deals));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message }));
  }
};
