// Shared token blacklist — avoids circular dependency between auth middleware and auth routes
// Automatically prunes expired entries every 10 minutes
const blacklist = new Set();

// Track token expiry for cleanup
const expiryMap = new Map();

const add = (token, expiresInMs = 5 * 24 * 60 * 60 * 1000) => {
  blacklist.add(token);
  expiryMap.set(token, Date.now() + expiresInMs);
};

const has = (token) => blacklist.has(token);

// Prune expired tokens every 10 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [token, expiry] of expiryMap) {
      if (now > expiry) {
        blacklist.delete(token);
        expiryMap.delete(token);
      }
    }
  },
  10 * 60 * 1000,
).unref();

module.exports = { add, has };
