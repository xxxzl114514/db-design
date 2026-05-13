// vitest.setup.ts
import { vi } from 'vitest';

// Mock ResizeObserver if it's not available in jsdom
global.ResizeObserver = require('resize-observer-polyfill');

// Mock IntersectionObserver if needed
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Add any other necessary mocks here