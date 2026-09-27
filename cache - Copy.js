import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120, useClones: false });

let cacheHits = 0;
let cacheMisses = 0;

export function getCachedValue(key) {
  const cachedValue = cache.get(key);
  if (cachedValue === undefined) {
    cacheMisses += 1;
    return null;
  }

  cacheHits += 1;
  return cachedValue;
}

export function setCachedValue(key, value, ttlSeconds = 60) {
  cache.set(key, value, ttlSeconds);
}

export function invalidateCache(keys) {
  cache.del(keys);
}

export function getCacheStats() {
  return {
    hits: cacheHits,
    misses: cacheMisses,
    keys: cache.keys(),
  };
}

export function resetCacheStats() {
  cacheHits = 0;
  cacheMisses = 0;
}

export default cache;
