// tests/mocks/factories/task.factory.ts
import { mockTasks } from '../fixtures/tasks';

export function createTask(overrides: Partial<typeof mockTasks[0]> = {}) {
    return {
        id: `task-${Date.now()}`,
        title: 'Default Task Title',
        status: 'backlog',
        priority: 'medium',
        assignee_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...overrides,
    };
}
