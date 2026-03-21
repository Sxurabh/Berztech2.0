// DEPRECATED: This config has been merged into vitest.workspace.js
// Both jsdom and node environments now run via the workspace config.
// Run: npx vitest run (uses vitest.workspace.js automatically)
// See: vitest.workspace.js for the new configuration structure
//
// Historical note: This file previously defined the node environment for
// tests/security/integration/**/*.test.js (real Supabase client calls).
// These now run as the 'node' project in the Vitest workspace.
