// Standalone Vercel handler stores list
const STORES = [
  { id: 'target-id', name: 'Target', slug: 'target', url: 'https://www.target.com', active: 1 },
  { id: 'walmart-id', name: 'Walmart', slug: 'walmart', url: 'https://www.walmart.com', active: 1 },
  { id: 'kroger-id', name: 'Kroger', slug: 'kroger', url: 'https://www.kroger.com', active: 1 },
  { id: 'aldi-id', name: 'Aldi', slug: 'aldi', url: 'https://www.aldi.us', active: 1 },
  { id: 'costco-id', name: 'Costco', slug: 'costco', url: 'https://www.costco.com', active: 1 },
  { id: 'sams-club-id', name: "Sam's Club", slug: 'sams-club', url: 'https://www.samsclub.com', active: 1 },
  { id: 'publix-id', name: 'Publix', slug: 'publix', url: 'https://www.publix.com', active: 1 },
  { id: 'heb-id', name: 'H-E-B', slug: 'heb', url: 'https://www.heb.com', active: 1 },
  { id: 'safeway-id', name: 'Safeway', slug: 'safeway', url: 'https://www.safeway.com', active: 1 },
  { id: 'trader-joes-id', name: "Trader Joe's", slug: 'trader-joes', url: 'https://www.traderjoes.com', active: 1 },
  { id: 'edwards-id', name: 'Edwards Cash Saver', slug: 'edwards', url: 'https://www.edwardsfoods.com', active: 1 }
];

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ url: req.url, method: req.method, headers: req.headers, stores: STORES }));
};