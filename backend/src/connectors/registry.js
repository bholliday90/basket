const BaseConnector = require('./connector');

// Map of store slug -> connector implementation.
// As specific store connectors are implemented, register them here.
const registry = {
  'target': require('./target'),
  'walmart': require('./walmart'),
  'kroger': require('./kroger'),
  'aldi': require('./aldi'),
  'costco': require('./costco'),
  'sams-club': require('./sams-club'),
};

/**
 * Fallback/Placeholder connector that simulates realistic price data.
 * This ensures the application works and has sample data even before
 * all specific scrapers are fully built.
 */
class GenericFallbackConnector extends BaseConnector {
  constructor(slug, options) {
    super(slug, options);
  }

  /**
   * Simulates a product price fetch.
   * Generates a stable, reproducible price unique to the product + store combination.
   * @param {Object} product - DB product record
   * @returns {Promise<Object>} Standardized price and product data
   */
  async fetchPrice(product) {
    console.log(`[${this.storeName}] Simulating price for "${product.name}"...`);
    
    // Simulate web latency (200ms - 500ms)
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

    // Create a deterministic seed based on product ID/name and store slug
    const prodSeed = (product.id || product.name || '').split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
    const storeSeed = this.storeSlug.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
    
    // Base price range: $1.50 to $15.50 based on product seed
    const basePrice = 1.50 + (prodSeed % 14);
    
    // Store modifier range: -15% to +15% based on store seed
    const storeModifier = 0.85 + ((storeSeed % 31) / 100);
    
    const price = parseFloat((basePrice * storeModifier).toFixed(2));

    return this.normalizeProductData({
      price,
      name: product.name,
      category: product.category,
      unit: product.unit,
      image_url: product.image_url
    }, product);
  }
}

/**
 * Gets the connector class for a given store slug.
 * Falls back to GenericFallbackConnector if not custom-implemented yet.
 * @param {string} slug - Store slug (e.g., 'target', 'walmart')
 * @returns {typeof BaseConnector}
 */
function getConnector(slug) {
  if (registry[slug]) {
    return registry[slug];
  }
  
  // Return the dynamic fallback class instantiated with this specific slug
  return class extends GenericFallbackConnector {
    constructor(options) {
      super(slug, options);
    }
  };
}

/**
 * Manually register a connector implementation.
 * @param {string} slug 
 * @param {typeof BaseConnector} connectorClass 
 */
function register(slug, connectorClass) {
  registry[slug] = connectorClass;
}

module.exports = {
  getConnector,
  register,
  registry
};
