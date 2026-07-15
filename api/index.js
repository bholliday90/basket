module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ url: req.url, method: req.method, headers: req.headers }));
};