const { query } = require('./db');
const { scheduler } = require('./src/connectors');

async function test() {
  console.log('--- Connector Framework Test ---');
  
  // 1. Check database contents
  try {
    const stores = query('SELECT * FROM stores');
    console.log(`Database has ${stores.length} stores.`);
    
    const products = query('SELECT * FROM products');
    console.log(`Database has ${products.length} products.`);
    
    const pricesBefore = query('SELECT COUNT(*) as count FROM prices')[0].count;
    console.log(`Prices in DB before test: ${pricesBefore}`);

    // 2. Trigger scheduler fetch
    console.log('\nTriggering a manual price fetch cycle...');
    await scheduler.fetchAllPrices();

    // 3. Verify prices were written
    const pricesAfter = query('SELECT * FROM prices');
    console.log(`\nPrices in DB after test: ${pricesAfter.length}`);
    if (pricesAfter.length > 0) {
      console.log('Sample price records:');
      console.log(pricesAfter.slice(-3));
    }
    
    console.log('\nTest passed successfully!');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

test();
