import { expect, afterAll, afterEach, beforeAll } from 'vitest';
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import { server } from './mocks/server';

expect.extend(toHaveNoViolations);

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() { return []; }
};

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
