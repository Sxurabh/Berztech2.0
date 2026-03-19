import { faker } from '@faker-js/faker';

const REQUEST_STATUSES = ['pending', 'approved', 'rejected', 'in_progress', 'completed'];
const BUDGET_RANGES = [
    { min: 5000, max: 15000 },
    { min: 15000, max: 30000 },
    { min: 30000, max: 50000 },
    { min: 50000, max: 100000 },
    { min: 100000, max: 250000 },
];
const TIMELINES = ['1 month', '2 months', '3 months', '4 months', '6 months', '9 months', '12 months'];

export function createRequest(overrides = {}) {
    const budgetRange = faker.helpers.arrayElement(BUDGET_RANGES);
    return {
        id: faker.string.uuid(),
        title: faker.helpers.arrayElement([
            'E-commerce Platform Development',
            'Mobile App Development',
            'API Integration Project',
            'Website Redesign',
            'Custom Software Solution',
            'Data Analytics Dashboard',
            'Cloud Migration',
            'Security Audit & Implementation',
        ]) + ` - ${faker.string.alphanumeric(4).toUpperCase()}`,
        description: faker.lorem.paragraph(),
        client_email: faker.internet.email().toLowerCase(),
        status: faker.helpers.arrayElement(REQUEST_STATUSES),
        budget: faker.number.int({ min: budgetRange.min, max: budgetRange.max }),
        timeline: faker.helpers.arrayElement(TIMELINES),
        created_at: faker.date.recent({ days: 60 }).toISOString(),
        updated_at: faker.date.recent({ days: 30 }).toISOString(),
        ...overrides,
    };
}

export function createPendingRequest(overrides = {}) {
    return createRequest({ status: 'pending', ...overrides });
}

export function createApprovedRequest(overrides = {}) {
    return createRequest({ status: 'approved', ...overrides });
}

export function createRejectedRequest(overrides = {}) {
    return createRequest({ status: 'rejected', ...overrides });
}

export function createRequestBatch(count = 5, overrides = {}) {
    return Array.from({ length: count }, () => createRequest(overrides));
}
