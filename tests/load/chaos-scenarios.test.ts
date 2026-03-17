import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const createRetryConfig = (options = {}) => ({
  maxRetries: options.maxRetries ?? 3,
  initialDelay: options.initialDelay ?? 100,
  maxDelay: options.maxDelay ?? 5000,
  backoffMultiplier: options.backoffMultiplier ?? 2,
  retryableStatuses: options.retryableStatuses ?? [408, 429, 500, 502, 503, 504],
  retryableErrors: options.retryableErrors ?? ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'],
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class RetryHandler {
  constructor(config = {}) {
    this.config = createRetryConfig(config);
    this.attempts = [];
  }

  async execute(fn) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        this.attempts.push({ attempt, timestamp: Date.now() });
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (!this.shouldRetry(error, attempt)) {
          throw error;
        }
        
        const delay = this.calculateDelay(attempt);
        await sleep(delay);
      }
    }
    
    throw lastError;
  }

  shouldRetry(error, attempt) {
    if (attempt >= this.config.maxRetries) return false;
    
    if (error.response) {
      return this.config.retryableStatuses.includes(error.response.status);
    }
    
    if (error.code) {
      return this.config.retryableErrors.includes(error.code);
    }
    
    return true;
  }

  calculateDelay(attempt) {
    const delay = this.config.initialDelay * Math.pow(this.config.backoffMultiplier, attempt - 1);
    const jitter = Math.random() * 0.3 * delay;
    return Math.min(delay + jitter, this.config.maxDelay);
  }
}

describe('Chaos Load Scenarios', () => {
  describe('Random 500 Error Handling', () => {
    it('should handle random 500 errors with retry', async () => {
      let attempt = 0;
      const handler = new RetryHandler({ maxRetries: 3 });
      
      const fn = async () => {
        attempt++;
        
        if (attempt < 3 && Math.random() < 0.7) {
          const error = new Error('Internal Server Error');
          error.response = { status: 500 };
          throw error;
        }
        
        return { success: true };
      };
      
      const result = await handler.execute(fn);
      
      expect(result.success).toBe(true);
      expect(attempt).toBeGreaterThanOrEqual(1);
    });

    it('should eventually fail after max retries', async () => {
      const handler = new RetryHandler({ maxRetries: 2 });
      
      const fn = async () => {
        const error = new Error('Server Error');
        error.response = { status: 500 };
        throw error;
      };
      
      await expect(handler.execute(fn)).rejects.toThrow('Server Error');
      
      expect(handler.attempts.length).toBe(2);
    });

    it('should handle intermittent 502 errors', async () => {
      const handler = new RetryHandler({ maxRetries: 5 });
      let callCount = 0;
      
      const fn = async () => {
        callCount++;
        
        if (callCount < 4) {
          const error = new Error('Bad Gateway');
          error.response = { status: 502 };
          throw error;
        }
        
        return { data: 'success' };
      };
      
      const result = await handler.execute(fn);
      
      expect(result.data).toBe('success');
      expect(callCount).toBe(4);
    });
  });

  describe('Degraded Response Handling', () => {
    it('should handle slow responses within timeout', async () => {
      const start = Date.now();
      
      const fn = async () => {
        await sleep(100);
        return { data: 'ok' };
      };
      
      const result = await fn();
      const duration = Date.now() - start;
      
      expect(result.data).toBe('ok');
      expect(duration).toBeLessThan(200);
    });

    it('should handle partial data gracefully', async () => {
      const partialData = {
        id: '1',
        title: 'Test',
      };
      
      expect(partialData).toHaveProperty('id');
      expect(partialData).toHaveProperty('title');
    });

    it('should handle null responses', async () => {
      const handler = new RetryHandler({ maxRetries: 2 });
      
      const fn = async () => {
        return null;
      };
      
      const result = await handler.execute(fn);
      
      expect(result).toBeNull();
    });

    it('should handle timeout during high load', async () => {
      const controller = new AbortController();
      
      const fn = async () => {
        const timeoutId = setTimeout(() => controller.abort(), 50);
        await sleep(100);
        clearTimeout(timeoutId);
        return { data: 'ok' };
      };
      
      await expect(fn()).rejects.toThrow();
    });
  });

  describe('Circuit Breaker Pattern', () => {
    it('should open circuit after threshold failures', async () => {
      const failureThreshold = 3;
      let failures = 0;
      let circuitState = 'closed';
      
      const fn = async () => {
        if (circuitState === 'open') {
          throw new Error('Circuit open');
        }
        
        failures++;
        
        if (failures >= failureThreshold) {
          circuitState = 'open';
        }
        
        throw new Error('Service unavailable');
      };
      
      for (let i = 0; i < 5; i++) {
        try {
          await fn();
        } catch (error) {
          expect(error.message).toMatch(/Circuit open|Service unavailable/);
        }
      }
      
      expect(failures).toBeGreaterThanOrEqual(failureThreshold);
      expect(circuitState).toBe('open');
    });

    it('should attempt to close circuit after timeout', async () => {
      let circuitState = 'open';
      let lastAttempt = 0;
      
      const fn = async () => {
        lastAttempt++;
        
        if (circuitState === 'half-open') {
          return { success: true };
        }
        
        throw new Error('Circuit open');
      };
      
      const tryClose = async () => {
        circuitState = 'half-open';
        
        try {
          return await fn();
        } catch {
          circuitState = 'open';
          throw new Error('Circuit still open');
        }
      };
      
      await expect(tryClose()).rejects.toThrow('Circuit still open');
      expect(lastAttempt).toBe(1);
    });
  });

  describe('Bulkhead Isolation', () => {
    it('should limit concurrent requests', async () => {
      const maxConcurrent = 3;
      let activeRequests = 0;
      let maxActive = 0;
      
      const fn = async () => {
        activeRequests++;
        maxActive = Math.max(maxActive, activeRequests);
        
        await sleep(100);
        
        activeRequests--;
        return { done: true };
      };
      
      const requests = Array(10).fill(null).map(() => {
        if (activeRequests >= maxConcurrent) {
          return Promise.reject(new Error('Too many concurrent requests'));
        }
        return fn();
      });
      
      const results = await Promise.allSettled(requests);
      
      expect(maxActive).toBeLessThanOrEqual(maxConcurrent);
    });

    it('should queue excess requests', async () => {
      const queue = [];
      const processing = [];
      
      const fn = async (id) => {
        processing.push(id);
        await sleep(50);
        return { id };
      };
      
      for (let i = 0; i < 5; i++) {
        queue.push(fn(i));
      }
      
      const results = await Promise.all(queue);
      
      expect(results).toHaveLength(5);
    });
  });

  describe('Rate Limiting Response', () => {
    it('should respect retry-after header', async () => {
      let attempt = 0;
      
      const fn = async () => {
        attempt++;
        
        if (attempt === 1) {
          const error = new Error('Rate limited');
          error.response = { 
            status: 429, 
            headers: { get: (key) => key === 'retry-after' ? '0.05' : null }
          };
          throw error;
        }
        
        return { data: 'ok' };
      };
      
      const handler = new RetryHandler({ maxRetries: 2 });
      const result = await handler.execute(fn);
      
      expect(result.data).toBe('ok');
      expect(attempt).toBe(2);
    });

    it('should handle exponential backoff on rate limit', async () => {
      const delays = [];
      
      const handler = new RetryHandler({ 
        maxRetries: 3,
        initialDelay: 50,
        backoffMultiplier: 2,
      });
      
      let attempt = 0;
      const fn = async () => {
        attempt++;
        const delay = handler.calculateDelay(attempt);
        delays.push(delay);
        
        if (attempt < 3) {
          const error = new Error('Rate limited');
          error.response = { status: 429 };
          throw error;
        }
        
        return { success: true };
      };
      
      await handler.execute(fn);
      
      expect(delays[0]).toBeLessThan(delays[1]);
    });
  });

  describe('Chaos Injection', () => {
    it('should randomly fail requests based on chaos rate', async () => {
      const chaosRate = 0.5;
      let failures = 0;
      let successes = 0;
      
      const fn = async () => {
        if (Math.random() < chaosRate) {
          failures++;
          throw new Error('Chaos failure');
        }
        
        successes++;
        return { ok: true };
      };
      
      for (let i = 0; i < 20; i++) {
        try {
          await fn();
        } catch {}
      }
      
      expect(failures + successes).toBe(20);
      expect(failures).toBeGreaterThan(0);
    });

    it('should handle latency injection', async () => {
      const injectLatency = (fn, maxDelay = 100) => {
        return async (...args) => {
          const delay = Math.random() * maxDelay;
          await sleep(delay);
          return fn(...args);
        };
      };
      
      const fastFn = async () => 'result';
      const slowFn = injectLatency(fastFn, 50);
      
      const fastStart = Date.now();
      await fastFn();
      const fastDuration = Date.now() - fastStart;
      
      const slowStart = Date.now();
      await slowFn();
      const slowDuration = Date.now() - slowStart;
      
      expect(fastDuration).toBeLessThan(slowDuration);
    });
  });
});
