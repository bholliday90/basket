const express = require('express');
const cors = require('cors');
const path = require('path');
const { query } = require('./db');
const { getAffiliateLink } = require('./src/affiliate');

/**
 * Creates and configures the Express application.
 * This is exported for serverless deployment (e.g. Vercel) 
 * and can be run directly for local development.
 */
function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  /**
   * GET /api/stores
   * List all active stores
   */
  app.get('/api/stores', async (req, res) => {
    try {
      const stores = query('SELECT * FROM stores WHERE active = 1');
      res.json(stores);
    } catch (error) {
      console.error('Error fetching stores:', error);
      res.status(500).json({ error: 'Failed to fetch stores' });
    }
  });

  /**
   * GET /api/products/search
   * Search products with prices across stores
   * Query params: q (search term), store (optional store slug)
   */
  app.get('/api/products/search', async (req, res) => {
    const { q, store } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query (q) is required' });
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
      res.json(results);
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({ error: 'Failed to search products' });
    }
  });

  /**
   * GET /api/products/:id/prices
   * Get prices for a specific product across all stores
   */
  app.get('/api/products/:id/prices', async (req, res) => {
    const { id } = req.params;

    try {
      const sql = `
        SELECT 
          pr.*, 
          s.name as store_name, 
          s.slug as store_slug,
          s.url as store_url
        FROM prices pr
        JOIN stores s ON pr.store_id = s.id
        WHERE pr.product_id = '${id.replace(/'/g, "''")}'
        ORDER BY pr.price ASC
      `;
      const prices = query(sql);
      res.json(prices);
    } catch (error) {
      console.error('Error fetching prices:', error);
      res.status(500).json({ error: 'Failed to fetch prices' });
    }
  });

  /**
   * GET /api/categories
   * List all product categories
   */
  app.get('/api/categories', async (req, res) => {
    try {
      const results = query('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category ASC');
      const categories = results.map(r => r.category);
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  /**
   * GET /api/deals
   * Find best prices/discounts
   */
  app.get('/api/deals', async (req, res) => {
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
      res.json(deals);
    } catch (error) {
      console.error('Error fetching deals:', error);
      res.status(500).json({ error: 'Failed to fetch deals' });
    }
  });

  /**
   * GET /api/compare
   * Get prices for a list of products across all stores
   */
  app.get('/api/compare', async (req, res) => {
    const { ids } = req.query;
    
    if (!ids) {
      return res.status(400).json({ error: 'Product IDs (ids) are required' });
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
      res.json(results);
    } catch (error) {
      console.error('Error fetching comparison data:', error);
      res.status(500).json({ error: 'Failed to fetch comparison data' });
    }
  });

  /**
   * GET /api/affiliate/:store/:productId
   * Get tracked affiliate link
   */
  app.get('/api/affiliate/:store/:productId', async (req, res) => {
    const { store, productId } = req.params;
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    try {
      const affiliateUrl = getAffiliateLink(store, productId, url);
      res.json({ affiliateUrl });
    } catch (error) {
      console.error('Error generating affiliate link:', error);
      res.status(500).json({ error: 'Failed to generate affiliate link' });
    }
  });

  // Production: serve built frontend static files
  // Only active when NOT running on Vercel (Vercel handles static files via vercel.json)
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    const frontendDist = path.join(__dirname, '../frontend/dist');
    app.use(express.static(frontendDist));
    
    // Catch-all for SPA routing
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) {
        return res.sendFile(path.join(frontendDist, 'index.html'));
      }
      next();
    });
  }

  // Basic error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });

  return app;
}

// Local development server and background tasks
if (require.main === module) {
  const port = process.env.PORT || 3001;
  const app = createApp();
  
  app.listen(port, '0.0.0.0', () => {
    console.log(`Backend listening on port ${port}`);
    
    // Start the background price fetching scheduler (default: every 4 hours)
    // Only run this when starting the server directly, not in serverless functions.
    const { scheduler } = require('./src/connectors');
    const interval = process.env.SCHEDULER_INTERVAL_MS || 4 * 60 * 60 * 1000;
    scheduler.start(interval);
  });
}

module.exports = createApp;
