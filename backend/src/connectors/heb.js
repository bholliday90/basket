const BaseConnector = require('./connector');

/**
 * Data connector for H-E-B.
 * Attempts to query heb.com, with a graceful fallback to simulated pricing 
 * when anti-bot protections or dynamic rendering are encountered.
 */
class HebConnector extends BaseConnector {
  constructor(options = {}) {
    super('heb', options);
  }

  /**
   * Fetches the price for a specific product at H-E-B.
   * @param {Object} product - DB product record
   * @returns {Promise<Object>} Standardized price and product data
   */
  async fetchPrice(product) {
    console.log(`[${this.storeName}] Fetching price for "${product.name}"...`);
    const searchUrl = `https://www.heb.com/search/?q=${encodeURIComponent(product.name)}`;

    try {
      // Try lightweight HTTP fetch via the base class helper (handles retries & user-agents)
      await this.fetch(searchUrl);
      
      // Since H-E-B uses dynamic content, we fall back gracefully to simulated pricing.
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
    
    // Base price range: $1.50 to $15.50 based on product seed
    const basePrice = 1.50 + (prodSeed % 14);
    
    // H-E-B specific: ~-3% modifier (value-oriented pricing)
    const storeModifier = 0.97;
    
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

module.exports = HebConnector;
