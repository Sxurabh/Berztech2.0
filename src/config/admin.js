// Only this email has admin access - configured via environment variable
export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL;

if (!ADMIN_EMAIL) {
    console.warn("ADMIN_EMAIL is not set in environment variables. Admin features may be inaccessible.");
}

export function isAdminEmail(email) {
    if (!email || !ADMIN_EMAIL) return false;
    return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
