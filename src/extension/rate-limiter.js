class RateLimiter {
  constructor(options = {}) {
    this.maxRequests = options.maxRequests || 100;  // Max requests per window
    this.timeWindow = options.timeWindow || 60000;  // Time window in milliseconds (default: 1 minute)
    this.tokens = this.maxRequests;  // Available tokens
    this.lastRefill = Date.now();    // Last token refill timestamp
    this.requestQueue = [];          // Queue for pending requests
    this.processing = false;         // Flag to prevent concurrent processing
  }

  async acquire() {
    // Refill tokens if time window has passed
    this.refillTokens();

    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }

    // Return promise that resolves when a token becomes available
    return new Promise((resolve) => {
      this.requestQueue.push(resolve);
      this.processQueue();
    });
  }

  refillTokens() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor(timePassed / this.timeWindow) * this.maxRequests;

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxRequests, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  async processQueue() {
    if (this.processing || this.requestQueue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.requestQueue.length > 0) {
      this.refillTokens();

      if (this.tokens > 0) {
        const resolve = this.requestQueue.shift();
        this.tokens--;
        resolve(true);
      } else {
        break;
      }
    }

    this.processing = false;
  }

  // Helper method to get current rate limit status
  getStatus() {
    this.refillTokens();
    return {
      availableTokens: this.tokens,
      queueLength: this.requestQueue.length,
      timeUntilNextRefill: this.timeWindow - (Date.now() - this.lastRefill)
    };
  }
}

// Usage example in content.js:
const rateLimiter = new RateLimiter({
  maxRequests: 100,    // 100 requests
  timeWindow: 60000    // per minute
});

export { RateLimiter }; 