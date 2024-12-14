import '@testing-library/jest-dom';
import { expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { configure } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { fetch, Request, Response } from 'node-fetch';
import 'openai/shims/node';

declare global {
  // eslint-disable-next-line no-var
  var fetch: typeof fetch;
  // eslint-disable-next-line no-var
  var Request: typeof Request;
  // eslint-disable-next-line no-var
  var Response: typeof Response;
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

// Configure React Testing Library
configure({
  reactStrictMode: true,
});

// Suppress React 18 specific warnings
const originalError = console.error;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
console.error = (...args: any[]) => {
  if (
    /Warning: ReactDOM.render is no longer supported in React 18/.test(args[0]) ||
    /Warning: unmountComponentAtNode is deprecated/.test(args[0]) ||
    /Warning: `ReactDOMTestUtils.act`/.test(args[0])
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Extend Vitest's expect with Testing Library matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-api-key';
process.env.VITE_OPENAI_API_KEY = 'test-api-key';

// Setup globals
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.fetch = fetch as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.Request = Request as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.Response = Response as any;
global.IS_REACT_ACT_ENVIRONMENT = true;
