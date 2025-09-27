// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock SVG elements for D3 tests
const mockSVGElement = {
  getBBox: jest.fn(() => ({
    x: 0,
    y: 0,
    width: 100,
    height: 100
  })),
  getBoundingClientRect: jest.fn(() => ({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    top: 0,
    left: 0,
    right: 100,
    bottom: 100
  })),
  getScreenCTM: jest.fn(() => ({
    a: 1, b: 0, c: 0, d: 1, e: 0, f: 0
  })),
  createSVGPoint: jest.fn(() => ({ x: 0, y: 0 }))
};

// Mock SVG methods
global.SVGElement = class SVGElement extends Element {
  getBBox() {
    return mockSVGElement.getBBox();
  }
  
  getBoundingClientRect() {
    return mockSVGElement.getBoundingClientRect();
  }
  
  getScreenCTM() {
    return mockSVGElement.getScreenCTM();
  }
  
  createSVGPoint() {
    return mockSVGElement.createSVGPoint();
  }
};

// Suppress console warnings in tests
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});
