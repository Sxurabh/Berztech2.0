// Only this email has admin access
export const ADMIN_EMAIL = "saurabhkirve@gmail.com";

export function isAdminEmail(email) {
    return email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
