/**
 * @fileoverview API Client for Live Security Integration Tests
 * 
 * This module provides utilities for making real HTTP requests to the 
 * live dev server (http://localhost:3000) for security testing.
 * 
 * Usage:
 *   - Ensure dev server is running: npm run dev
 *   - Run tests: npm run test:security:live
 * 
 * Required env vars in tests/.env.test:
 *   - PLAYWRIGHT_BASE_URL=http://localhost:3000
 *   - TEST_CLIENT_EMAIL, TEST_CLIENT_PASSWORD
 *   - TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'tests/.env.test') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

export const skipIfNoServer = process.env.SKIP_LIVE_TESTS === 'true';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://srouvvdubxktqyihwphc.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyb3V2dmR1YnhrdHF5aWh3cGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3Mjg3MzEsImV4cCI6MjA4NjMwNDczMX0.2dXdU8R_2l1UyCtXciGJ05xB8I_9zBoaoP2tRPStXx4';

// ============================================================================
// ATTACK PAYLOADS
// ============================================================================

const SQL_PAYLOADS = {
  UNION: "' UNION SELECT * FROM users--",
  OR_TRUE: "' OR '1'='1",
  DROP_TABLE: "'; DROP TABLE users;--",
  ADMIN_BYPASS: "admin'--",
  DELETE_INLINE: "1; DELETE FROM requests WHERE 1=1",
  NESTED: "') OR ('1'='1",
  FALSE_CONDITION: "1' AND '1'='2",
  COMMAND_EXEC: "'; EXEC xp_cmdshell('dir');--",
  TIME_BLIND: "1' WAITFOR DELAY '0:0:5'--",
  BENCHMARK: "' OR BENCHMARK(1000000,MD5(1))--",
  SLEEP: "' OR SLEEP(5)--",
  COMMENT_END: "'--",
  QUOTE_END: "'",
  DOUBLE_DASH: "--",
  ORACLE_COMMENT: "/*",
};

const XSS_PAYLOADS = {
  SCRIPT_TAG: "<script>alert('XSS')</script>",
  IMG_ERROR: '<img src=x onerror=alert(1)>',
  SVG_ONLOAD: "<svg onload=alert(1)>",
  JAVASCRIPT_PROTOCOL: "javascript:alert(1)",
  BODY_ONLOAD: "<body onload=alert(1)>",
  IFRAME: "<iframe src=javascript:alert(1)>",
  INPUT_ONFOCUS: '<input onfocus=alert(1) autofocus>',
  MARQUEE: "<marquee onstart=alert(1)>",
  ANCHOR_HREF: '<a href="javascript:alert(1)">click</a>',
  META_REFRESH: '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">',
  QUOTE_BREAKOUT: '"><script>alert(1)</script>',
  NESTED_SCRIPT: "<scr<script>ipt>alert(1)</scr</script>ipt>",
  SVG_ANIMATE: '<svg><animate onbegin=alert(1) attributeName=x/>',
  ONERROR_IMG: '<img src="x" onerror="alert(1)">',
  BODY_ONERROR: '<body onerror="alert(1)">',
  VIDEO: '<video><source onerror="alert(1)">',
  AUDIO: '<audio src=x onerror=alert(1)>',
  OBJECT: '<object data="javascript:alert(1)">',
  EMBED: '<embed src="javascript:alert(1)">',
  FORM_ACTION: '<form action="javascript:alert(1)"><button>XSS</button></form>',
  SVG_PATH: '<svg><path d="alert(1)"/>',
};

const PATH_TRAVERSAL_PAYLOADS = {
  UNIX_UP: "../../../etc/passwd",
  WINDOWS_UP: "..\\..\\..\\windows\\system32\\config\\sam",
  DOUBLE_EXT_JPG: "file.php.jpg",
  DOUBLE_EXT_REVERSE: "file.jpg.php",
  PHP5: "file.php5",
  NULL_BYTE: "file.php%00.jpg",
  DOUBLE_URL_ENCODED: "..%2f..%2f..%2fetc%2fpasswd",
  UTF8: "..%c0%af..%c0%af..%c0%afetc%c0%afpasswd",
  OVER_LONG: "../".repeat(20) + "etc/passwd",
};

const JWT_MALFORMED_PAYLOADS = {
  ALG_NONE: "eyJhbGciOiJub25lIiwicm9sZSI6ImFkbWluIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.",
  WRONG_ALG: "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.signature",
  EXPIRED: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDAwMDAwfQ.signature",
  FUTURE_IAT: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsImlhdCI6MjAwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.signature",
  MALFORMED: "not-a-valid-jwt",
  RANDOM: "abc.def.ghi",
};

const EMAIL_INJECTION_PAYLOADS = {
  NEWLINE_CCF: "test@example.com\nCC: victim@evil.com",
  NEWLINE_BCC: "test@example.com\r\nBCC: admin@evil.com",
  URL_ENCODED: "test@example.com%0a%0dX-Mailer: Hacker",
  SQL_INJECTION: "'; DROP TABLE subscribers; --@test.com",
  MULTIPLE_AT: "test@evildomain.com@real.com",
  EMPTY_LOCAL: "@example.com",
  NO_TLD: "test@",
  DOUBLE_DOT: "test..test@example.com",
};

// ============================================================================
// AUTH HELPERS
// ============================================================================

let cachedClientToken = null;
let cachedAdminToken = null;

async function login(email, password) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  
  if (!response.ok || data.access_token) {
    return data.access_token || null;
  }
  
  console.error('Login failed:', data);
  return null;
}

async function getClientToken() {
  if (cachedClientToken) return cachedClientToken;
  
  const email = process.env.TEST_CLIENT_EMAIL;
  const password = process.env.TEST_CLIENT_PASSWORD;
  
  if (!email || !password) {
    throw new Error('TEST_CLIENT_EMAIL or TEST_CLIENT_PASSWORD not set in .env.test');
  }
  
  cachedClientToken = await login(email, password);
  return cachedClientToken;
}

async function getAdminToken() {
  if (cachedAdminToken) return cachedAdminToken;
  
  const email = process.env.TEST_ADMIN_EMAIL;
  const password = process.env.TEST_ADMIN_PASSWORD;
  
  if (!email || !password) {
    throw new Error('TEST_ADMIN_EMAIL or TEST_ADMIN_PASSWORD not set in .env.test');
  }
  
  cachedAdminToken = await login(email, password);
  return cachedAdminToken;
}

async function logout(token) {
  if (!token) return;
  
  await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
    },
  });
}

function clearCachedTokens() {
  cachedClientToken = null;
  cachedAdminToken = null;
}

// ============================================================================
// HTTP HELPERS
// ============================================================================

async function fetchJson(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  if (options.token) {
    defaultHeaders['Authorization'] = `Bearer ${options.token}`;
  }
  
  if (options.origin !== undefined) {
    if (options.origin === null) {
      delete defaultHeaders['Origin'];
    } else {
      defaultHeaders['Origin'] = options.origin;
    }
  }
  
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    return {
      status: response.status,
      statusText: response.statusText,
      data,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error) {
    return {
      status: 0,
      statusText: error.message,
      data: { error: error.message },
      headers: {},
    };
  }
}

async function fetchFormData(endpoint, formData, token = null) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    return {
      status: response.status,
      statusText: response.statusText,
      data,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error) {
    return {
      status: 0,
      statusText: error.message,
      data: { error: error.message },
      headers: {},
    };
  }
}

async function fetchRaw(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    return {
      status: response.status,
      statusText: response.statusText,
      data,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error) {
    return {
      status: 0,
      statusText: error.message,
      data: { error: error.message },
      headers: {},
    };
  }
}

// ============================================================================
// TEST DATA HELPERS
// ============================================================================

const createdTestData = {
  requests: [],
  blogPosts: [],
  projects: [],
  notifications: [],
};

function generateUniqueId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

async function createTestRequest(token, overrides = {}) {
  const id = generateUniqueId();
  const payload = {
    name: `TEST_User_${id}`,
    email: `test${id}@example.com`,
    company: 'TEST_Company',
    services: ['web-development'],
    budget: '$5k-$10k',
    message: `TEST_message_${id}`,
    ...overrides,
  };
  
  const response = await fetchJson('/api/requests', {
    method: 'POST',
    token,
    body: payload,
  });
  
  if (response.status === 201 || response.status === 200) {
    createdTestData.requests.push(response.data?.data?.id || id);
    return response.data?.data || { id, ...payload };
  }
  
  return null;
}

async function createTestBlogPost(token, overrides = {}) {
  const id = generateUniqueId();
  const payload = {
    title: `TEST_Post_${id}`,
    slug: `test-post-${id}`,
    content: `TEST_content_${id}`,
    excerpt: 'TEST_excerpt',
    ...overrides,
  };
  
  const response = await fetchJson('/api/blog', {
    method: 'POST',
    token,
    body: payload,
  });
  
  if (response.status === 201 || response.status === 200) {
    createdTestData.blogPosts.push(response.data?.slug || payload.slug);
    return response.data || { slug: payload.slug, ...payload };
  }
  
  return null;
}

async function createTestProject(token, overrides = {}) {
  const id = generateUniqueId();
  const payload = {
    name: `TEST_Project_${id}`,
    description: 'TEST_description',
    category: 'web-development',
    status: 'active',
    ...overrides,
  };
  
  const response = await fetchJson('/api/projects', {
    method: 'POST',
    token,
    body: payload,
  });
  
  if (response.status === 201 || response.status === 200) {
    createdTestData.projects.push(response.data?.data?.id || id);
    return response.data?.data || { id, ...payload };
  }
  
  return null;
}

async function cleanupTestData(token) {
  const adminToken = await getAdminToken();
  
  for (const slug of createdTestData.blogPosts) {
    try {
      await fetchJson(`/api/blog/${slug}`, {
        method: 'DELETE',
        token: adminToken,
      });
    } catch (e) {
      // Ignore cleanup errors
    }
  }
  
  createdTestData.requests = [];
  createdTestData.blogPosts = [];
  createdTestData.projects = [];
  createdTestData.notifications = [];
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  BASE_URL,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  
  // Payloads
  SQL_PAYLOADS,
  XSS_PAYLOADS,
  PATH_TRAVERSAL_PAYLOADS,
  JWT_MALFORMED_PAYLOADS,
  EMAIL_INJECTION_PAYLOADS,
  
  // Auth
  login,
  getClientToken,
  getAdminToken,
  logout,
  clearCachedTokens,
  
  // HTTP
  fetchJson,
  fetchFormData,
  fetchRaw,
  
  // Test Data
  createTestRequest,
  createTestBlogPost,
  createTestProject,
  cleanupTestData,
  generateUniqueId,
  createdTestData,
};
