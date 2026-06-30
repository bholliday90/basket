const url = require('url');
const createApp = require('../backend/index');

module.exports = (req, res) => {
  const app = createApp();
  
  // Vercel rewrite passes the original path as ?_path=...
  const parsed = url.parse(req.url, true);
  if (parsed.query._path) {
    req.url = '/api' + parsed.query._path;
  }
  
  app(req, res);
};