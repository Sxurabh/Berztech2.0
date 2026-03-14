/**
 * @fileoverview k6 Load Test for Contact Form (POST /api/requests)
 * 
 * Run with: k6 run tests/load/api-requests.js
 * Or with custom base URL: k6 run -e BASE_URL=https://your-site.com tests/load/api-requests.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const requestDuration = new Trend('request_duration');
const successRate = new Rate('success_rate');

// Get base URL from environment or use default
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test configuration
export const options = {
  // Test stages - ramp up, hold, ramp down
  stages: [
    { duration: '30s', target: 20 },    // Ramp to 20 users over 30s
    { duration: '1m', target: 20 },     // Hold at 20 users for 1 minute
    { duration: '30s', target: 0 },    // Ramp down to 0 users over 30s
  ],

  // Thresholds
  thresholds: {
    // 95th percentile response time should be below 800ms
    'http_req_duration': ['p(95) < 800'],
    // 95th percentile response time for successful requests
    'http_req_duration{status:201}': ['p(95) < 800'],
    // Error rate should be below 1%
    'error_rate': ['rate < 0.01'],
    // Success rate should be above 99%
    'success_rate': ['rate > 0.99'],
    // HTTP request failed rate should be below 1%
    'http_req_failed': ['rate < 0.01'],
  },

  // Test summary settings
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

// Generate a unique email for each VU to avoid duplicate constraint issues
function generateEmail(vuId) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `loadtest-${vuId}-${timestamp}-${random}@example.com`;
}

// Generate realistic request data
function generateRequestData(vuId) {
  return {
    name: `Test User ${vuId}`,
    email: generateEmail(vuId),
    company: 'Load Test Company',
    services: ['Web Development', 'UI/UX Design'],
    budget: '$10k - $25k',
    message: 'This is a load test message. '.repeat(10),
  };
}

// Main test function
export default function () {
  const vuId = __VU; // Virtual User ID
  
  const payload = JSON.stringify(generateRequestData(vuId));
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: {
      name: 'contact_form_submit',
    },
  };

  const startTime = Date.now();
  const response = http.post(`${BASE_URL}/api/requests`, payload, params);
  const duration = Date.now() - startTime;

  // Record custom metrics
  requestDuration.add(duration);

  // Check response
  const checks = {
    'status is 201': (r) => r.status === 201,
    'response time < 800ms': (r) => r.timings.duration < 800,
    'response has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data !== undefined || body.success === true;
      } catch (e) {
        return false;
      }
    },
    'content-type is json': (r) => r.headers['Content-Type']?.includes('application/json'),
  };

  const checkResult = check(response, checks);
  
  // Update metrics
  errorRate.add(!checkResult);
  successRate.add(response.status === 201);

  // Log errors for debugging
  if (response.status !== 201) {
    console.error(`VU ${vuId}: Request failed with status ${response.status}`);
    console.error(`VU ${vuId}: Response body: ${response.body}`);
  }

  // Simulate user think time between requests
  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}

// Setup function - runs once before all VUs
export function setup() {
  console.log(`Starting load test against: ${BASE_URL}`);
  console.log('Test configuration:');
  console.log('  - Target: POST /api/requests');
  console.log('  - Max VUs: 20');
  console.log('  - Duration: ~2 minutes');
  console.log('  - Threshold: p95 < 800ms, error rate < 1%');
  
  // Verify the endpoint is accessible
  const healthCheck = http.get(`${BASE_URL}/api/requests`, {
    headers: { 'Accept': 'application/json' },
  });
  
  if (healthCheck.status !== 405) { // 405 Method Not Allowed is expected for GET
    console.warn(`Warning: Endpoint returned ${healthCheck.status}, expected 405 for GET`);
  }
  
  return { baseUrl: BASE_URL };
}

// Teardown function - runs once after all VUs complete
export function teardown(data) {
  console.log('\n=== Load Test Complete ===');
  console.log(`Tested endpoint: ${data.baseUrl}/api/requests`);
  console.log('Results:');
  console.log('  - Check console output above for detailed metrics');
  console.log('  - Thresholds should pass for test to be successful');
}

// Handle summary
export function handleSummary(data) {
  return {
    stdout: JSON.stringify({
      test: 'Contact Form Load Test',
      timestamp: new Date().toISOString(),
      metrics: {
        total_requests: data.metrics.http_reqs?.count || 0,
        avg_duration: data.metrics.http_req_duration?.avg || 0,
        p95_duration: data.metrics.http_req_duration?.['p(95)'] || 0,
        error_rate: data.metrics.error_rate?.rate || 0,
        success_rate: data.metrics.success_rate?.rate || 0,
      },
      thresholds: {
        p95_under_800ms: (data.metrics.http_req_duration?.['p(95)'] || 0) < 800,
        error_rate_under_1_percent: (data.metrics.error_rate?.rate || 0) < 0.01,
      },
      passed: data.metrics.http_req_duration?.['p(95)'] < 800 && 
              data.metrics.error_rate?.rate < 0.01,
    }, null, 2),
  };
}
