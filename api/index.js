const serverless = require('serverless-http');
const createApp = require('../backend/index');
const app = createApp();

module.exports = serverless(app);