import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('isAdminEmail', () => {
  const originalAdminEmail = process.env.ADMIN_EMAIL;

  beforeEach(() => {
    vi.stubEnv('ADMIN_EMAIL', 'saurabhkirve@gmail.com');
    vi.stubEnv('NEXT_PUBLIC_ADMIN_EMAIL', 'saurabhkirve@gmail.com');
    vi.resetModules();
  });

  afterEach(() => {
    vi.stubEnv('ADMIN_EMAIL', originalAdminEmail);
    vi.resetModules();
  });

  it('returns true for configured admin email (exact match)', async () => {
    const { isAdminEmail } = await import('@/config/admin');
    expect(isAdminEmail('saurabhkirve@gmail.com')).toBe(true);
  });

  it('returns true regardless of letter case (upper/lower)', async () => {
    const { isAdminEmail } = await import('@/config/admin');
    expect(isAdminEmail('SAURABHKIRVE@GMAIL.COM')).toBe(true);
    expect(isAdminEmail('Saurabhkirve@Gmail.Com')).toBe(true);
    expect(isAdminEmail('sAuRaBhKiRvE@gMaIl.CoM')).toBe(true);
  });

  it('returns false for a random non-admin email', async () => {
    const { isAdminEmail } = await import('@/config/admin');
    expect(isAdminEmail('user@example.com')).toBe(false);
    expect(isAdminEmail('john@company.org')).toBe(false);
  });

  it('returns false for empty string', async () => {
    const { isAdminEmail } = await import('@/config/admin');
    expect(isAdminEmail('')).toBe(false);
  });

  it('returns false for null', async () => {
    const { isAdminEmail } = await import('@/config/admin');
    expect(isAdminEmail(null)).toBe(false);
  });

  it('returns false for undefined', async () => {
    const { isAdminEmail } = await import('@/config/admin');
    expect(isAdminEmail(undefined)).toBe(false);
  });

  it('returns false for an email with the same domain but different username', async () => {
    const { isAdminEmail } = await import('@/config/admin');
    expect(isAdminEmail('admin2@example.com')).toBe(false);
    expect(isAdminEmail('administrator@example.com')).toBe(false);
    expect(isAdminEmail('support@example.com')).toBe(false);
  });

  it('returns false for a string that contains the admin email but has extra characters', async () => {
    const { isAdminEmail } = await import('@/config/admin');
    expect(isAdminEmail('fakesaurabhkirve@gmail.com')).toBe(false);
    expect(isAdminEmail('saurabhkirve@gmail.com.fake')).toBe(false);
    expect(isAdminEmail('notsaurabhkirve@gmail.com')).toBe(false);
  });
});
describe('isAdminEmail: missing ADMIN_EMAIL env var', () => {
  it('returns false for ALL emails when ADMIN_EMAIL is not set', async () => {
    vi.stubEnv('ADMIN_EMAIL', '');
    vi.stubEnv('NEXT_PUBLIC_ADMIN_EMAIL', '');
    vi.resetModules();
    const { isAdminEmail } = await import('@/config/admin');
    // No email should be admin when the env var is empty
    expect(isAdminEmail('admin@example.com')).toBe(false);
    expect(isAdminEmail('')).toBe(false);
    expect(isAdminEmail('root@localhost')).toBe(false);
  });

  it('does not fall back to a hardcoded admin email', async () => {
    vi.stubEnv('ADMIN_EMAIL', '');
    vi.resetModules();
    const { isAdminEmail } = await import('@/config/admin');
    // If there is a hardcoded fallback, this test catches it
    const commonFallbacks = ['admin@admin.com', 'admin@localhost', 'test@test.com'];
    for (const email of commonFallbacks) {
      expect(isAdminEmail(email)).toBe(false);
    }
  });
});
