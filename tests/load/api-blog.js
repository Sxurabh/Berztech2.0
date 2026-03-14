/**
 * @fileoverview k6 Load Test for Blog API (GET /api/blog)
 * 
 * Tests the blog listing endpoint which should be fast with ISR caching
 * 
 * Run with: k6 run tests/load/api-blog.js
 * Or with custom base URL: k6 run -e BASE_URL=https://your-site.com tests/load/api-blog.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const cacheHitRate = new Rate('cache_hit_rate');
const responseTimeTrend = new Trend('response_time');
const errorRate = new Rate('error_rate');
const requestCount = new Counter('request_count');

// Get base URL from environment or use default
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test configuration
export const options = {
  // Test stages - ramp up, hold, ramp down
  stages: [
    { duration: '30s', target: 50 },    // Ramp to 50 users over 30s
    { duration: '2m', target: 50 },      // Hold at 50 users for 2 minutes
    { duration: '30s', target: 0 },    // Ramp down to 0 users over 30s
  ],

  // Thresholds
  thresholds: {
    // 95th percentile response time should be below 400ms (GET should be fast with caching)
    'http_req_duration': ['p(95) < 400'],
    // 95th percentile for successful requests
    'http_req_duration{status:200}': ['p(95) < 400'],
    // Average response time should be below 300ms
    'response_time': ['avg < 300'],
    // Error rate should be below 1%
    'error_rate': ['rate < 0.01'],
    // 99th percentile should be reasonable
    'http_req_duration': ['p(99) < 800'],
  },

  // Test summary settings
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

// Test scenarios
const scenarios = {
  // Main scenario - GET blog posts
  getBlogPosts: () => {
    const params = {
      headers: {
        'Accept': 'application/json',
      },
      tags: {
        name: 'get_blog_posts',
      },
    };

    const startTime = Date.now();
    const response = http.get(`${BASE_URL}/api/blog`, params);
    const duration = Date.now() - startTime;

    // Record metrics
    responseTimeTrend.add(duration);
    requestCount.add(1);

    // Check for cache headers (X-Vercel-Cache or similar)
    const cacheHeader = response.headers['X-Vercel-Cache'] || 
                       response.headers['x-vercel-cache'] ||
                       response.headers['X-Cache'] ||
                       response.headers['x-cache'];
    
    if (cacheHeader) {
      cacheHitRate.add(cacheHeader.includes('HIT') || cacheHeader.includes('hit'));
    }

    // Run checks
    const checks = {
      'status is 200': (r) => r.status === 200,
      'response time < 400ms': (r) => r.timings.duration < 400,
      'response is JSON': (r) => r.headers['Content-Type']?.includes('application/json'),
      'response has data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body) || Array.isArray(body.data);
        } catch (e) {
          return false;
        }
      },
      'response time < 300ms (avg)': (r) => r.timings.duration < 300,
    };

    const checkResult = check(response, checks);
    errorRate.add(!checkResult);

    // Log slow requests
    if (response.timings.duration > 400) {
      console.warn(`Slow request: ${response.timings.duration}ms`);
    }

    return response;
  },

  // Get specific blog post (if IDs are available)
  getBlogPost: (postId) => {
    if (!postId) return null;

    const params = {
      headers: {
        'Accept': 'application/json',
      },
      tags: {
        name: 'get_single_blog_post',
      },
    };

    const startTime = Date.now();
    const response = http.get(`${BASE_URL}/api/blog/${postId}`, params);
    const duration = Date.now() - startTime;

    responseTimeTrend.add(duration);
    requestCount.add(1);

    const checks = {
      'single post status is 200': (r) => r.status === 200,
      'single post response is JSON': (r) => r.headers['Content-Type']?.includes('application/json'),
    };

    const checkResult = check(response, checks);
    errorRate.add(!checkResult);

    return response;
  },
};

// Main test function
export default function () {
  // Main scenario: Get blog posts list
  const response = scenarios.getBlogPosts();

  // Occasionally request a specific post (20% of the time)
  if (Math.random() < 0.2 && response && response.status === 200) {
    try {
      const body = JSON.parse(response.body);
      const posts = Array.isArray(body) ? body : body.data;
      if (posts && posts.length > 0) {
        const randomPost = posts[Math.floor(Math.random() * posts.length)];
        if (randomPost && (randomPost.id || randomPost.slug)) {
          scenarios.getBlogPost(randomPost.id || randomPost.slug);
        }
      }
    } catch (e) {
      // Silently ignore JSON parse errors
    }
  }

  // Simulate realistic user behavior
  // Vary the sleep time to simulate different user patterns
  const thinkTime = Math.random() * 2 + 0.5; // 0.5 - 2.5 seconds
  sleep(thinkTime);
}

// Setup function
export function setup() {
  console.log(`Starting load test against: ${BASE_URL}`);
  console.log('Test configuration:');
  console.log('  - Target: GET /api/blog');
  console.log('  - Max VUs: 50');
  console.log('  - Duration: ~3 minutes');
  console.log('  - Threshold: p95 < 400ms, error rate < 1%');
  console.log('  - Expected: Fast responses due to ISR caching');

  // Verify endpoint is accessible
  const healthCheck = http.get(`${BASE_URL}/api/blog`, {
    headers: { 'Accept': 'application/json' },
  });

  if (healthCheck.status !== 200) {
    console.error(`Error: Endpoint returned ${healthCheck.status}, expected 200`);
    console.error('Response:', healthCheck.body);
  } else {
    console.log('✓ Endpoint is accessible');
    try {
      const body = JSON.parse(healthCheck.body);
      const posts = Array.isArray(body) ? body : body.data;
      console.log(`✓ Found ${posts?.length || 0} blog posts`);
    } catch (e) {
      console.warn('Warning: Could not parse response body');
    }
  }

  return { baseUrl: BASE_URL };
}

// Teardown function
export function teardown(data) {
  console.log('\n=== Load Test Complete ===');
  console.log(`Tested endpoint: ${data.baseUrl}/api/blog`);
  console.log('Results:');
  console.log('  - Check console output above for detailed metrics');
  console.log('  - Thresholds should pass for test to be successful');
  console.log('  - With ISR caching, p95 should be < 400ms');
}

// Handle summary
export function handleSummary(data) {
  const p95 = data.metrics.http_req_duration?.['p(95)'] || 0;
  const errorRate = data.metrics.error_rate?.rate || 0;
  const cacheHits = data.metrics.cache_hit_rate?.rate || 0;

  return {
    stdout: JSON.stringify({
      test: 'Blog API Load Test',
      timestamp: new Date().toISOString(),
      metrics: {
        total_requests: data.metrics.http_reqs?.count || 0,
        avg_duration: data.metrics.http_req_duration?.avg || 0,
        p95_duration: p95,
        p99_duration: data.metrics.http_req_duration?.['p(99)'] || 0,
        error_rate: errorRate,
        cache_hit_rate: cacheHits,
      },
      thresholds: {
        p95_under_400ms: p95 < 400,
        error_rate_under_1_percent: errorRate < 0.01,
      },
      performance_rating: p95 < 200 ? 'Excellent' : 
                         p95 < 400 ? 'Good' : 
                         p95 < 800 ? 'Acceptable' : 'Poor',
      passed: p95 < 400 && errorRate < 0.01,
    }, null, 2),
  };
}
