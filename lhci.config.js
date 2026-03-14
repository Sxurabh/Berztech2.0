/**
 * @fileoverview Lighthouse CI Configuration
 * Performance regression testing for critical pages
 */

module.exports = {
  ci: {
    collect: {
      // URLs to test
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/blog',
        'http://localhost:3000/work',
        'http://localhost:3000/contact',
        'http://localhost:3000/about',
      ],
      // Number of runs per URL
      numberOfRuns: 3,
      // Server start command
      startServerCommand: 'npm run start',
      // Wait for server to be ready
      startServerReadyPattern: 'ready on',
      // Settings
      settings: {
        preset: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        throttling: {
          // Simulate fast 3G
          rttMs: 150,
          throughputKbps: 1638,
          cpuSlowdownMultiplier: 4,
        },
      },
    },
    assert: {
      // Assertion preset
      preset: 'lighthouse:recommended',
      // Custom assertions
      assertions: {
        // Performance score ≥ 0.85 (warn)
        'categories:performance': ['warn', { minScore: 0.85 }],
        // Accessibility score ≥ 0.90 (error - blocks CI)
        'categories:accessibility': ['error', { minScore: 0.90 }],
        // Best practices score ≥ 0.80 (warn)
        'categories:best-practices': ['warn', { minScore: 0.80 }],
        // SEO score ≥ 0.80 (warn)
        'categories:seo': ['warn', { minScore: 0.80 }],

        // Core Web Vitals
        // First Contentful Paint ≤ 2000ms (warn)
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        // Largest Contentful Paint ≤ 3500ms (error)
        'largest-contentful-paint': ['error', { maxNumericValue: 3500 }],
        // Cumulative Layout Shift ≤ 0.1 (error)
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        // Total Blocking Time ≤ 300ms (warn)
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        // Time to Interactive ≤ 5000ms (warn)
        'interactive': ['warn', { maxNumericValue: 5000 }],

        // Offscreen images lazy-loaded
        'offscreen-images': 'warn',
        // Uses responsive images
        'uses-responsive-images': 'warn',
        // Minified CSS
        'unminified-css': 'warn',
        // Minified JavaScript
        'unminified-javascript': 'warn',
      },
    },
    upload: {
      // Upload to temporary public storage
      target: 'temporary-public-storage',
      // Or use these for custom server:
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: 'your-build-token',
    },
    server: {
      // Storage for local runs
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: '/tmp/lhci.db',
      },
    },
  },
};
