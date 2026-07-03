const { getAffiliateLink } = require('../../../backend/src/affiliate');
const url = require('url');

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { store, productId } = req.query; // Vercel maps path params to req.query
  const { url: originalUrl } = url.parse(req.url, true).query;

  if (!originalUrl) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: 'Original URL is required' }));
  }

  try {
    const affiliateUrl = getAffiliateLink(store, productId, originalUrl);
    res.end(JSON.stringify({ affiliateUrl }));
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Failed to generate affiliate link' }));
  }
};
