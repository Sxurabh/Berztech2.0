import { faker } from '@faker-js/faker';

const TASK_STATUSES = ['backlog', 'inprogress', 'done'];
const PRIORITIES = ['low', 'medium', 'high'];

const DEFAULT_TITLES = [
    'Set up project infrastructure',
    'Implement authentication',
    'Create dashboard components',
    'Add client management features',
    'Write documentation',
    'Design database schema',
    'Implement API endpoints',
    'Write unit tests',
    'Configure CI/CD pipeline',
    'Deploy to production',
];

export function createTask(overrides = {}) {
    return {
        id: `task-${faker.string.uuid()}`,
        title: faker.helpers.arrayElement(DEFAULT_TITLES),
        description: faker.lorem.sentence(),
        status: faker.helpers.arrayElement(TASK_STATUSES),
        priority: faker.helpers.arrayElement(PRIORITIES),
        assignee_id: faker.datatype.boolean({ probability: 0.7 }) ? faker.string.uuid() : null,
        created_at: faker.date.recent({ days: 30 }).toISOString(),
        updated_at: faker.date.recent({ days: 7 }).toISOString(),
        ...overrides,
    };
}

export function createTaskBatch(count = 5, overrides = {}) {
    return Array.from({ length: count }, () => createTask(overrides));
}

export function createBacklogTask(overrides = {}) {
    return createTask({ status: 'backlog', ...overrides });
}

export function createInProgressTask(overrides = {}) {
    return createTask({ status: 'inprogress', ...overrides });
}

export function createDoneTask(overrides = {}) {
    return createTask({ status: 'done', ...overrides });
}

export function createHighPriorityTask(overrides = {}) {
    return createTask({ priority: 'high', ...overrides });
}
