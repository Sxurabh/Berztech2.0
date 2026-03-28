// Shared mock for @/config/admin to prevent "ADMIN_EMAIL is not set" warnings
// This mock returns true for common test admin emails

import { vi } from 'vitest';

vi.mock("@/config/admin", () => ({
    isAdminEmail: vi.fn().mockImplementation((email) => {
        return email === "admin@test.com" || 
               email === "admin@berztech.com" ||
               email === "saurabhkirve@gmail.com" ||
               email === process.env.ADMIN_EMAIL;
    }),
}));
