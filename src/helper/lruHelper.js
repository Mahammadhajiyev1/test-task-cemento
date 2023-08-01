const { LRUCache } = require("lru-cache");

const cache = new LRUCache({
  max: 1000,
  updateAgeOnGet: true,
  noDisposeOnSet: true,
});

module.exports = cache;
