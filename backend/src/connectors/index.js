const BaseConnector = require('./connector');
const registry = require('./registry');
const normalizer = require('./normalizer');
const scheduler = require('./scheduler');

module.exports = {
  BaseConnector,
  getConnector: registry.getConnector,
  registerConnector: registry.register,
  registry: registry.registry,
  normalizer,
  scheduler
};
