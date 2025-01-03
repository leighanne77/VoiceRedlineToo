/**
 * Rate limiter using token bucket algorithm with configurable limits per API endpoint
 */
class RateLimiter {
  constructor(config = {}) {
    this.limits = {
      voice: {
        maxTokens: config.voice?.maxTokens || 60,    // 60 requests
        refillRate: config.voice?.refillRate || 1,   // 1 token per second
        refillInterval: 1000                         // 1 second
      },
      api: {
        maxTokens: config.api?.maxTokens || 100,     // 100 requests
        refillRate: config.api?.refillRate || 1.67,  // 100 per minute
        refillInterval: 1000                         // 1 second
      }
    };

    // Initialize buckets
    this.buckets = new Map();
    Object.keys(this.limits).forEach(type => {
      this.buckets.set(type, {
        tokens: this.limits[type].maxTokens,
        lastRefill: Date.now()
      });
    });

    // Start token refill intervals
    this.startRefillIntervals();
  }

  startRefillIntervals() {
    Object.keys(this.limits).forEach(type => {
      setInterval(() => this.refillBucket(type), this.limits[type].refillInterval);
    });
  }

  refillBucket(type) {
    const bucket = this.buckets.get(type);
    const limit = this.limits[type];
    const now = Date.now();
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = (timePassed / 1000) * limit.refillRate;

    bucket.tokens = Math.min(limit.maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  async acquire(type, count = 1) {
    return new Promise((resolve, reject) => {
      const bucket = this.buckets.get(type);
      if (!bucket) {
        reject(new Error(`Unknown rate limit type: ${type}`));
        return;
      }

      if (bucket.tokens >= count) {
        bucket.tokens -= count;
        resolve(true);
      } else {
        const waitTime = this.getWaitTime(type, count);
        reject({
          error: 'Rate limit exceeded',
          waitTime,
          type
        });
      }
    });
  }

  getWaitTime(type, count) {
    const bucket = this.buckets.get(type);
    const limit = this.limits[type];
    const tokensNeeded = count - bucket.tokens;
    return Math.ceil((tokensNeeded / limit.refillRate) * 1000);
  }

  getStatus(type) {
    const bucket = this.buckets.get(type);
    return {
      availableTokens: Math.floor(bucket.tokens),
      maxTokens: this.limits[type].maxTokens,
      refillRate: this.limits[type].refillRate,
      waitTimeForNext: bucket.tokens < 1 ? this.getWaitTime(type, 1) : 0
    };
  }
}

export { RateLimiter }; 