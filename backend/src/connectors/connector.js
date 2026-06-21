const axios = require('axios');
const { query } = require('../../db');
const normalizer = require('./normalizer');

/**
 * Base class for all store data connectors.
 * Provides shared utilities like fetch with retries, rate limiting, and product normalization.
 */
class BaseConnector {
  /**
   * @param {string} storeSlug - Unique slug of the store (e.g. 'target', 'walmart')
   * @param {Object} options - Configuration options
   */
  constructor(storeSlug, options = {}) {
    this.storeSlug = storeSlug;
    this.retryLimit = options.retryLimit ?? 3;
    this.retryDelay = options.retryDelay ?? 1000; // base delay for exponential backoff in ms
    this.rateLimitDelay = options.rateLimitDelay ?? 1000; // minimum gap between fetches in ms
    this.lastRequestTime = 0;

    // Load store metadata from the database
    try {
      const stores = query(`SELECT * FROM stores WHERE slug = '${storeSlug}'`);
      if (stores && stores.length > 0) {
        this.storeId = stores[0].id;
        this.storeName = stores[0].name;
        this.storeUrl = stores[0].url;
        this.storeActive = stores[0].active;
      } else {
        console.warn(`[BaseConnector] Store with slug "${storeSlug}" not found in database.`);
        this.storeId = `${storeSlug}-id`;
        this.storeName = storeSlug.charAt(0).toUpperCase() + storeSlug.slice(1);
        this.storeUrl = '';
        this.storeActive = 1;
      }
    } catch (err) {
      console.error(`[BaseConnector] Error loading store config for "${storeSlug}":`, err.message);
      this.storeId = `${storeSlug}-id`;
      this.storeName = storeSlug;
      this.storeActive = 1;
    }
  }

  /**
   * Throttles requests to enforce rate-limiting.
   * Ensures at least rateLimitDelay ms has elapsed since the last request.
   */
  async throttle() {
    if (this.rateLimitDelay > 0) {
      const elapsed = Date.now() - this.lastRequestTime;
      if (elapsed < this.rateLimitDelay) {
        const waitTime = this.rateLimitDelay - elapsed;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      this.lastRequestTime = Date.now();
    }
  }

  /**
   * Performs an HTTP request with built-in retry logic, rate-limiting, and standard headers.
   * @param {string} url - Target URL
   * @param {Object} options - Axios request config
   * @returns {Promise<any>} Response data
   */
  async fetch(url, options = {}) {
    let attempt = 0;
    const maxAttempts = options.retryLimit ?? this.retryLimit;
    const baseDelay = options.retryDelay ?? this.retryDelay;

    while (attempt < maxAttempts) {
      try {
        await this.throttle();

        const mergedHeaders = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          ...options.headers
        };

        const response = await axios({
          url,
          method: 'get',
          timeout: 10000,
          ...options,
          headers: mergedHeaders
        });

        return response.data;
      } catch (error) {
        attempt++;
        console.warn(`[${this.storeName}] Fetch failed for ${url} (Attempt ${attempt}/${maxAttempts}): ${error.message}`);
        
        if (attempt >= maxAttempts) {
          throw new Error(`[${this.storeName}] Max retries reached for ${url}: ${error.message}`);
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Fetches the price for a specific product at this store.
   * Subclasses MUST override this method.
   * @param {Object} product - The product record from the DB.
   * @returns {Promise<Object>} Standardized price and product data.
   */
  async fetchPrice(product) {
    throw new Error(`fetchPrice() is not implemented for store "${this.storeSlug}"`);
  }

  /**
   * Standardizes raw parsed product data.
   * @param {Object} rawProduct - Raw scraped fields { price, name, category, unit, image_url }
   * @param {Object} dbProduct - Original product record from DB for fallbacks
   * @returns {Object} Normalized price record ready for database insertion
   */
  normalizeProductData(rawProduct, dbProduct = {}) {
    const name = normalizer.normalizeName(rawProduct.name || dbProduct.name || '');
    const category = normalizer.normalizeCategory(rawProduct.category || dbProduct.category || '');
    
    // Extract unit and qty if not provided explicitly
    const extracted = normalizer.extractUnitAndQty(name);
    const unit = normalizer.normalizeUnit(rawProduct.unit || dbProduct.unit || extracted.unit);
    
    const price = parseFloat(rawProduct.price);
    if (isNaN(price)) {
      throw new Error(`[${this.storeName}] Invalid price scraped: ${rawProduct.price}`);
    }

    const quantity = extracted.quantity || 1;
    const unit_price = price / quantity;

    return {
      product_id: dbProduct.id,
      store_id: this.storeId,
      price,
      unit_price: parseFloat(unit_price.toFixed(4)),
      name,
      category,
      unit,
      image_url: rawProduct.image_url || dbProduct.image_url || null
    };
  }
}

module.exports = BaseConnector;
