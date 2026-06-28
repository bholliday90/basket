/** @type {typeof import('child_process').execSync} */
let execSync;
try {
  execSync = require('child_process').execSync;
} catch (e) {
  // child_process not available (e.g. Vercel serverless), will use in-memory fallback
  execSync = null;
}

/**
 * In-memory fallback data for when team-db is not available (e.g. Vercel).
 */
const FALLBACK_STORES = [
  { id: 'target-id', name: 'Target', slug: 'target', url: 'https://www.target.com', active: 1 },
  { id: 'walmart-id', name: 'Walmart', slug: 'walmart', url: 'https://www.walmart.com', active: 1 },
  { id: 'kroger-id', name: 'Kroger', slug: 'kroger', url: 'https://www.kroger.com', active: 1 },
  { id: 'aldi-id', name: 'Aldi', slug: 'aldi', url: 'https://www.aldi.us', active: 1 },
  { id: 'costco-id', name: 'Costco', slug: 'costco', url: 'https://www.costco.com', active: 1 },
  { id: 'sams-club-id', name: "Sam's Club", slug: 'sams-club', url: 'https://www.samsclub.com', active: 1 }
];

const FALLBACK_CATEGORIES = ['Dairy & Eggs', 'Bakery & Bread', 'Produce', 'Meat & Seafood', 'Pantry', 'Snacks & Candy', 'Beverages', 'Frozen Foods'];

const FALLBACK_PRODUCTS = [
  { id: 'p1', name: 'Whole Milk, 1 Gal', category: 'Dairy & Eggs', unit: '1 Gal' },
  { id: 'p2', name: 'Large Eggs, 12ct', category: 'Dairy & Eggs', unit: '12 ct' },
  { id: 'p3', name: 'White Bread', category: 'Bakery & Bread', unit: '20 oz' },
  { id: 'p4', name: 'Bananas', category: 'Produce', unit: '1 lb' },
  { id: 'p5', name: 'Chicken Breast, 1 lb', category: 'Meat & Seafood', unit: '1 lb' },
  { id: 'p6', name: 'Greek Yogurt', category: 'Dairy & Eggs', unit: '32 oz' },
];

function seedFromName(name) {
  return (name || '').split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
}

function generatePrice(productSeed, storeSeed) {
  const basePrice = 1.50 + (productSeed % 14);
  const modifier = 0.85 + ((storeSeed % 31) / 100);
  return parseFloat((basePrice * modifier).toFixed(2));
}

// Build in-memory prices for all product × store combinations
const FALLBACK_PRICES = [];
for (const product of FALLBACK_PRODUCTS) {
  for (const store of FALLBACK_STORES) {
    const prodSeed = seedFromName(product.id);
    const storeSeed = seedFromName(store.slug);
    FALLBACK_PRICES.push({
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      unit: product.unit,
      image_url: '',
      price: generatePrice(prodSeed, storeSeed),
      unit_price: generatePrice(prodSeed, storeSeed),
      store_name: store.name,
      store_slug: store.slug,
      store_url: store.url,
      fetched_at: new Date().toISOString()
    });
  }
}

/**
 * Fallback in-memory query for environments without team-db CLI.
 */
function fallbackQuery(sql) {
  const lower = sql.toLowerCase().trim();

  if (lower.includes('from stores')) {
    return FALLBACK_STORES.filter(s => s.active);
  }

  if (lower.includes('distinct category')) {
    return [...new Set(FALLBACK_PRICES.map(p => p.category))].map(c => ({ category: c }));
  }

  if (lower.includes('from products')) {
    const match = sql.match(/LIKE '%([^']+)%'/i);
    const searchTerm = match ? match[1].toLowerCase() : '';

    let results = FALLBACK_PRICES.filter(p =>
      p.product_name.toLowerCase().includes(searchTerm)
    );

    const storeMatch = sql.match(/slug = '([^']+)'/);
    if (storeMatch) {
      results = results.filter(p => p.store_slug === storeMatch[1]);
    }

    results.sort((a, b) => a.price - b.price);
    return results;
  }

  if (lower.includes('where pr.product_id = ')) {
    const match = sql.match(/product_id = '([^']+)'/);
    if (match) {
      return FALLBACK_PRICES
        .filter(p => p.product_id === match[1])
        .sort((a, b) => a.price - b.price);
    }
  }

  if (lower.includes('min(price)')) {
    const cheapest = {};
    for (const p of FALLBACK_PRICES) {
      if (!cheapest[p.product_id] || p.price < cheapest[p.product_id].price) {
        cheapest[p.product_id] = { ...p };
      }
    }
    return Object.values(cheapest).slice(0, 20);
  }

  if (lower.includes('in (')) {
    const match = sql.match(/product_id IN \('([^)]+)'\)/);
    if (match) {
      const ids = match[1].split("','");
      return FALLBACK_PRICES
        .filter(p => ids.includes(p.product_id))
        .sort((a, b) => a.product_id.localeCompare(b.product_id) || a.price - b.price);
    }
  }

  return [];
}

/**
 * Executes a SQL query using the team-db CLI with in-memory fallback for Vercel.
 */
function query(sql, retries = 5, delay = 500) {
  try {
    if (!execSync) throw new Error('child_process not available');
    const output = execSync(`team-db "${sql.replace(/"/g, '\\"')}"`, { encoding: 'utf8', timeout: 5000 });
    return JSON.parse(output);
  } catch (error) {
    const errorMsg = error.message || '';
    const isLockError = errorMsg.includes('Locking error') || errorMsg.includes('locked') || errorMsg.includes('sync engine operation failed');

    if (isLockError && retries > 0) {
      const backoff = delay + Math.random() * 500;
      console.warn(`[DB] Locked, retrying in ${backoff.toFixed(0)}ms... (${retries} left)`);
      return new Promise(resolve => setTimeout(() => resolve(query(sql, retries - 1, delay * 1.5)), backoff));
    }

    console.warn('[DB] team-db not available, using in-memory fallback');
    return fallbackQuery(sql);
  }
}

module.exports = { query };