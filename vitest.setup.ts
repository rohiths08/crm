import '@testing-library/jest-dom'

// Mock ResizeObserver for Recharts / virtualizer support in jsdom
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = MockResizeObserver
