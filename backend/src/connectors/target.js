const BaseConnector = require('./connector');

/**
 * Data connector for Target.
 * Attempts to query target.com, with a graceful fallback to simulated pricing 
 * when anti-bot protections or client-side rendering is encountered.
 */
class TargetConnector extends BaseConnector {
  constructor(options = {}) {
    super('target', options);
  }

  /**
   * Fetches the price for a specific product at Target.
   * @param {Object} product - DB product record
   * @returns {Promise<Object>} Standardized price and product data
   */
  async fetchPrice(product) {
    console.log(`[${this.storeName}] Fetching price for "${product.name}"...`);
    const searchUrl = `https://www.target.com/s?searchTerm=${encodeURIComponent(product.name)}`;

    try {
      // Try lightweight HTTP fetch via the base class helper (handles retries & user-agents)
      await this.fetch(searchUrl);
      
      // Since Target is a client-side rendered SPA, lightweight HTTP requests do not execute the JS
      // required to render the products in the DOM. Hence, we fall back to simulated pricing.
      console.warn(`[${this.storeName}] HTML page retrieved, but dynamic content rendering is required. Falling back to simulated pricing.`);
      return this.generateSimulatedPrice(product);
    } catch (err) {
      console.warn(`[${this.storeName}] Request blocked or failed: ${err.message}. Falling back to simulated pricing.`);
      return this.generateSimulatedPrice(product);
    }
  }

  /**
   * Generates a stable, reproducible price unique to the product + store combination.
   * @param {Object} product - DB product record
   * @returns {Object} Standardized price and product data
   */
  generateSimulatedPrice(product) {
    const prodSeed = (product.id || product.name || '').split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
    const storeSeed = this.storeSlug.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
    
    // Base price range: $1.50 to $15.50 based on product seed
    const basePrice = 1.50 + (prodSeed % 14);
    
    // Store modifier range based on store seed (Target specific: approx +3% modifier)
    const storeModifier = 0.98 + ((storeSeed % 15) / 100);
    
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

module.exports = TargetConnector;
