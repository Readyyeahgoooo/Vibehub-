// Rate limiting utilities using KV storage

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Rate limiter using KV storage
 */
export class RateLimiter {
  private kv: any; // KVNamespace type
  private config: RateLimitConfig;
  private prefix: string;

  constructor(kv: any, config: RateLimitConfig, prefix: string = 'ratelimit') {
    this.kv = kv;
    this.config = config;
    this.prefix = prefix;
  }

  /**
   * Check if request is allowed and update counter
   */
  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const key = `${this.prefix}:${identifier}`;
    const now = Date.now();
    
    // Get current count and timestamp
    const data = await this.kv.get(key, { type: 'json' });
    
    if (!data) {
      // First request in window
      await this.kv.put(
        key,
        JSON.stringify({ count: 1, startTime: now }),
        { expirationTtl: Math.ceil(this.config.windowMs / 1000) }
      );
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetAt: now + this.config.windowMs,
      };
    }

    const { count, startTime } = data;
    const elapsed = now - startTime;

    // Check if window has expired
    if (elapsed >= this.config.windowMs) {
      // Reset counter
      await this.kv.put(
        key,
        JSON.stringify({ count: 1, startTime: now }),
        { expirationTtl: Math.ceil(this.config.windowMs / 1000) }
      );
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetAt: now + this.config.windowMs,
      };
    }

    // Check if limit exceeded
    if (count >= this.config.maxRequests) {
      const resetAt = startTime + this.config.windowMs;
      const retryAfter = Math.ceil((resetAt - now) / 1000);
      
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfter,
      };
    }

    // Increment counter
    await this.kv.put(
      key,
      JSON.stringify({ count: count + 1, startTime }),
      { expirationTtl: Math.ceil((this.config.windowMs - elapsed) / 1000) }
    );

    return {
      allowed: true,
      remaining: this.config.maxRequests - count - 1,
      resetAt: startTime + this.config.windowMs,
    };
  }

  /**
   * Get current rate limit status without incrementing
   */
  async getStatus(identifier: string): Promise<RateLimitResult> {
    const key = `${this.prefix}:${identifier}`;
    const now = Date.now();
    
    const data = await this.kv.get(key, { type: 'json' });
    
    if (!data) {
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetAt: now + this.config.windowMs,
      };
    }

    const { count, startTime } = data;
    const elapsed = now - startTime;

    if (elapsed >= this.config.windowMs) {
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetAt: now + this.config.windowMs,
      };
    }

    const allowed = count < this.config.maxRequests;
    const resetAt = startTime + this.config.windowMs;

    return {
      allowed,
      remaining: Math.max(0, this.config.maxRequests - count),
      resetAt,
      retryAfter: allowed ? undefined : Math.ceil((resetAt - now) / 1000),
    };
  }

  /**
   * Reset rate limit for identifier
   */
  async reset(identifier: string): Promise<void> {
    const key = `${this.prefix}:${identifier}`;
    await this.kv.delete(key);
  }
}

/**
 * Pre-configured rate limiters
 */
export const RATE_LIMITS = {
  SUBMISSION: {
    maxRequests: 3,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
  },
  VERIFICATION: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  API_GENERAL: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
};

/**
 * Create rate limiter for submissions
 */
export function createSubmissionLimiter(kv: any): RateLimiter {
  return new RateLimiter(kv, RATE_LIMITS.SUBMISSION, 'submit');
}

/**
 * Create rate limiter for verifications
 */
export function createVerificationLimiter(kv: any): RateLimiter {
  return new RateLimiter(kv, RATE_LIMITS.VERIFICATION, 'verify');
}

/**
 * Create rate limiter for general API calls
 */
export function createAPILimiter(kv: any): RateLimiter {
  return new RateLimiter(kv, RATE_LIMITS.API_GENERAL, 'api');
}
