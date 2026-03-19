import { faker } from '@faker-js/faker';

export function createUser(overrides = {}) {
    const id = faker.string.uuid();
    return {
        id,
        email: faker.internet.email().toLowerCase(),
        email_confirmed_at: faker.date.recent({ days: 30 }).toISOString(),
        app_metadata: {
            provider: 'email',
            providers: ['email'],
        },
        user_metadata: {
            email: faker.internet.email().toLowerCase(),
            email_verified: faker.datatype.boolean(),
            full_name: faker.person.fullName(),
        },
        aud: 'authenticated',
        created_at: faker.date.past({ years: 1 }).toISOString(),
        ...overrides,
    };
}

export function createAdminUser(overrides = {}) {
    return createUser({
        email: 'admin@berztech.com',
        user_metadata: {
            ...overrides.user_metadata,
            email: 'admin@berztech.com',
            full_name: 'Admin User',
            email_verified: true,
        },
        ...overrides,
    });
}

export function createClientUser(overrides = {}) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return createUser({
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        user_metadata: {
            ...overrides.user_metadata,
            full_name: `${firstName} ${lastName}`,
            email_verified: faker.datatype.boolean(),
        },
        ...overrides,
    });
}

export function createAnonSession() {
    return null;
}
