const AFFILIATE_CONFIG = {
  'target': {
    baseUrl: 'https://goto.target.com/c/',
    idEnv: 'AFFILIATE_ID_TARGET'
  },
  'walmart': {
    baseUrl: 'https://goto.walmart.com/c/',
    idEnv: 'AFFILIATE_ID_WALMART'
  },
  'kroger': {
    baseUrl: 'https://goto.kroger.com/c/',
    idEnv: 'AFFILIATE_ID_KROGER'
  },
  'aldi': {
    baseUrl: 'https://goto.aldi.us/c/',
    idEnv: 'AFFILIATE_ID_ALDI'
  },
  'costco': {
    baseUrl: 'https://goto.costco.com/c/',
    idEnv: 'AFFILIATE_ID_COSTCO'
  },
  'sams-club': {
    baseUrl: 'https://goto.samsclub.com/c/',
    idEnv: 'AFFILIATE_ID_SAMS_CLUB'
  },
  'publix': {
    baseUrl: 'https://goto.publix.com/c/',
    idEnv: 'AFFILIATE_ID_PUBLIX'
  },
  'heb': {
    baseUrl: 'https://goto.heb.com/c/',
    idEnv: 'AFFILIATE_ID_HEB'
  },
  'safeway': {
    baseUrl: 'https://goto.safeway.com/c/',
    idEnv: 'AFFILIATE_ID_SAFEWAY'
  },
  'trader-joes': {
    baseUrl: 'https://goto.traderjoes.com/c/',
    idEnv: 'AFFILIATE_ID_TRADER_JOES'
  },
  'edwards': {
    baseUrl: 'https://goto.edwardsfoods.com/c/',
    idEnv: 'AFFILIATE_ID_EDWARDS'
  }
};

/**
 * Generates an affiliate link for a given store and product.
 * @param {string} storeSlug - The slug of the store.
 * @param {string} productId - The ID of the product.
 * @param {string} originalUrl - The original product URL.
 * @returns {string} - The tracked affiliate link or original URL if not configured.
 */
function getAffiliateLink(storeSlug, productId, originalUrl) {
  const config = AFFILIATE_CONFIG[storeSlug];
  if (!config) return originalUrl;

  const affiliateId = process.env[config.idEnv];
  if (!affiliateId) {
    // Fallback if no ID is configured, maybe just return original or a generic placeholder
    return originalUrl;
  }

  // Example placeholder format: baseUrl + affiliateId + ?u= + encodedOriginalUrl
  return `${config.baseUrl}${affiliateId}?u=${encodeURIComponent(originalUrl)}`;
}

module.exports = { getAffiliateLink };
