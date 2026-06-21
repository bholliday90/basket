const crypto = require('crypto');
const { query } = require('../../db');
const registry = require('./registry');

let intervalId = null;

/**
 * Executes a single price fetch cycle across all active stores and products.
 */
async function fetchAllPrices() {
  console.log(`[Scheduler] Starting price fetching cycle at ${new Date().toISOString()}...`);
  
  try {
    // 1. Fetch active stores
    const activeStores = query("SELECT * FROM stores WHERE active = 1");
    if (!activeStores || activeStores.length === 0) {
      console.warn('[Scheduler] No active stores found in database. Skipping cycle.');
      return;
    }
    console.log(`[Scheduler] Found ${activeStores.length} active stores: ${activeStores.map(s => s.name).join(', ')}.`);

    // 2. Fetch all products
    const products = query("SELECT * FROM products");
    if (!products || products.length === 0) {
      console.warn('[Scheduler] No products found in database. Skipping cycle.');
      return;
    }
    console.log(`[Scheduler] Found ${products.length} products to track.`);

    // 3. For each active store, run its connector
    for (const store of activeStores) {
      console.log(`[Scheduler] Processing store: ${store.name} (${store.slug})...`);
      
      try {
        const ConnectorClass = registry.getConnector(store.slug);
        const connector = new ConnectorClass();

        // Run products sequentially to avoid database locking collisions
        for (const product of products) {
          try {
            console.log(`[Scheduler] Fetching price for [${product.name}] at [${store.name}]...`);
            
            const normalizedData = await connector.fetchPrice(product);
            
            // Insert the price record into the database
            const priceId = crypto.randomUUID();
            query(`
              INSERT INTO prices (id, product_id, store_id, price, unit_price, fetched_at)
              VALUES (
                '${priceId}', 
                '${normalizedData.product_id}', 
                '${normalizedData.store_id}', 
                ${normalizedData.price}, 
                ${normalizedData.unit_price}, 
                CURRENT_TIMESTAMP
              )
            `);
            
            console.log(`[Scheduler] Saved price: $${normalizedData.price} (unit: $${normalizedData.unit_price}/${normalizedData.unit}) for [${product.name}] at [${store.name}].`);
            
            // Wait 200ms between products to prevent sqlite locks or overwhelming stores
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (prodErr) {
            console.error(`[Scheduler] Failed to fetch price for [${product.name}] at [${store.name}]:`, prodErr.message);
          }
        }
      } catch (storeErr) {
        console.error(`[Scheduler] Error running connector for store ${store.name}:`, storeErr.message);
      }
    }
    console.log(`[Scheduler] Price fetching cycle completed successfully at ${new Date().toISOString()}.`);
  } catch (err) {
    console.error('[Scheduler] Price fetching cycle crashed with error:', err.message);
  }
}

/**
 * Starts the periodic price fetching scheduler.
 * @param {number} intervalMs - Interval between cycles in ms (default 1 hour).
 */
function start(intervalMs = 3600000) {
  if (intervalId) {
    console.warn('[Scheduler] Scheduler is already running.');
    return;
  }

  console.log(`[Scheduler] Starting periodic price fetching (interval: ${(intervalMs / 1000 / 60).toFixed(1)} mins)...`);
  
  // Run immediately in background after a brief delay
  setTimeout(() => {
    fetchAllPrices();
  }, 1000);

  // Setup interval
  intervalId = setInterval(fetchAllPrices, intervalMs);
}

/**
 * Stops the periodic price fetching scheduler.
 */
function stop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[Scheduler] Scheduler stopped.');
  } else {
    console.log('[Scheduler] Scheduler was not running.');
  }
}

module.exports = {
  fetchAllPrices,
  start,
  stop
};
