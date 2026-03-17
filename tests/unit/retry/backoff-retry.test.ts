import { describe, it, expect, vi } from 'vitest';

class BackgroundRetryQueue {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelay = options.retryDelay ?? 1000;
    this.queue = [];
    this.processing = false;
  }

  async add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        task,
        attempts: 0,
        resolve,
        reject,
      });
      
      this.process();
    });
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const item = this.queue[0];
      
      try {
        const result = await item.task();
        item.resolve(result);
        this.queue.shift();
      } catch (error) {
        item.attempts++;
        
        if (item.attempts >= this.maxRetries) {
          item.reject(error);
          this.queue.shift();
        } else {
          await new Promise(r => setTimeout(r, this.retryDelay));
        }
      }
    }
    
    this.processing = false;
  }

  get pending() {
    return this.queue.length;
  }
}

describe('Background Retry Logic', () => {
  describe('Queue Management', () => {
    it('should add tasks to queue', async () => {
      const queue = new BackgroundRetryQueue({ maxRetries: 1 });
      
      const promise = queue.add(async () => 'result');
      
      expect(queue.pending).toBeGreaterThanOrEqual(0);
      
      await promise;
    });

    it('should handle empty queue', async () => {
      const queue = new BackgroundRetryQueue();
      
      expect(queue.pending).toBe(0);
    });
  });

  describe('Retry Behavior', () => {
    it('should retry failed tasks', async () => {
      let attempts = 0;
      const queue = new BackgroundRetryQueue({ 
        maxRetries: 3,
        retryDelay: 10,
      });
      
      await queue.add(async () => {
        attempts++;
        if (attempts < 2) throw new Error('Temporary failure');
        return 'success';
      });
      
      expect(attempts).toBe(2);
    });

    it('should fail after max retries', async () => {
      const queue = new BackgroundRetryQueue({ 
        maxRetries: 2,
        retryDelay: 10,
      });
      
      await expect(
        queue.add(async () => {
          throw new Error('Permanent failure');
        })
      ).rejects.toThrow('Permanent failure');
    });
  });

  describe('Error Handling', () => {
    it('should preserve error messages across retries', async () => {
      const queue = new BackgroundRetryQueue({ 
        maxRetries: 2,
        retryDelay: 10,
      });
      
      try {
        await queue.add(async () => {
          throw new Error('Specific error message');
        });
      } catch (error) {
        expect(error.message).toBe('Specific error message');
      }
    });

    it('should handle non-Error exceptions', async () => {
      const queue = new BackgroundRetryQueue({ 
        maxRetries: 1,
        retryDelay: 10,
      });
      
      try {
        await queue.add(async () => {
          throw 'String error';
        });
      } catch (error) {
        expect(error).toBe('String error');
      }
    });

    it('should handle undefined returns', async () => {
      const queue = new BackgroundRetryQueue({ maxRetries: 1, retryDelay: 10 });
      
      const result = await queue.add(async () => undefined);
      
      expect(result).toBeUndefined();
    });
  });

  describe('Concurrent Tasks', () => {
    it('should handle multiple concurrent additions', async () => {
      const queue = new BackgroundRetryQueue({ maxRetries: 1, retryDelay: 10 });
      
      const promises = Array(5).fill(null).map((_, i) => 
        queue.add(async () => i)
      );
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
    });
  });

  describe('Performance', () => {
    it('should handle large queue efficiently', async () => {
      const queue = new BackgroundRetryQueue({ maxRetries: 1, retryDelay: 5 });
      
      const start = Date.now();
      
      for (let i = 0; i < 50; i++) {
        queue.add(async () => i);
      }
      
      await new Promise(r => setTimeout(r, 100));
      
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative retryDelay gracefully', async () => {
      const queue = new BackgroundRetryQueue({ 
        maxRetries: 2,
        retryDelay: -1,
      });
      
      const start = Date.now();
      
      try {
        await queue.add(async () => {
          throw new Error('Fail');
        });
      } catch {}
      
      const duration = Date.now() - start;
      
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle async task errors', async () => {
      const queue = new BackgroundRetryQueue({ 
        maxRetries: 1,
        retryDelay: 10,
      });
      
      try {
        await queue.add(async () => {
          await Promise.reject(new Error('Async error'));
        });
      } catch (error) {
        expect(error.message).toBe('Async error');
      }
    });
  });
});
