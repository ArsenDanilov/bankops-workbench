import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { server } from '../mocks/server';
import { resetMockReviewQueue } from '../mocks/reviewQueueState';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

beforeEach(() => {
  resetMockReviewQueue({ latencyMs: 0 });
  // jsdom has no layout engine/ResizeObserver. This API stub does not simulate
  // sizes or prove real text truncation; geometry remains a browser concern.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  if (vi.isFakeTimers()) vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  server.resetHandlers();
});

afterAll(() => server.close());
