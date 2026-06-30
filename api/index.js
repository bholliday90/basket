const url = require('url');

module.exports = (req, res) => {
  const parsed = url.parse(req.url, true);
  res.json({
    message: 'API is working',
    url: req.url,
    path: parsed.pathname,
    query: parsed.query,
    method: req.method
  });
};