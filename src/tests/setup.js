const { beforeAll } = require('@jest/globals');
// Load test environment first
require('dotenv').config({ path: '.env.test' });

function validateEnvironment() {
  // Validate environment
  const requiredVars = [
    'GROQ_API_KEY',
    'WEBSOCKET_PORT',
    'SERVER_PORT',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_DOCS_API_KEY',
    'CHROME_EXTENSION_ID',
    'PRIMARY_MODEL',
    'FALLBACK_MODEL'
  ];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      throw new Error(`Missing required test environment variable: ${varName}`);
    }
  });

  // Add warning for missing OAuth secret
  if (!process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('Warning: GOOGLE_CLIENT_SECRET not set. OAuth tests will be skipped.');
  }
}

module.exports = { validateEnvironment };

beforeAll(() => {
  validateEnvironment();
});

// Mock browser globals
global.chrome = {
  runtime: {
    connect: () => ({
      onMessage: { addListener: jest.fn() },
      postMessage: jest.fn()
    }),
    lastError: null,
    id: process.env.CHROME_EXTENSION_ID
  },
  identity: {
    getAuthToken: jest.fn((options, callback) => {
      if (config.oauth.clientId && config.oauth.clientSecret) {
        callback('test-token-' + Date.now());
      } else {
        callback(undefined);
        chrome.runtime.lastError = new Error('OAuth credentials missing');
      }
    }),
    removeCachedAuthToken: jest.fn((options, callback) => callback())
  }
};

// Mock WebSocket with proper readyState values
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  constructor() {
    this.readyState = MockWebSocket.CLOSED;
    this.onopen = jest.fn();
    this.onclose = jest.fn();
    this.onmessage = jest.fn();
    this.onerror = jest.fn();
    this.send = jest.fn();
    this.close = jest.fn();
    this.lastOptions = null;
  }
}
global.WebSocket = jest.fn((url, options) => {
  const ws = new MockWebSocket();
  ws.lastOptions = options;
  return ws;
});

// Mock Speech Recognition with confidence values
global.webkitSpeechRecognition = class MockSpeechRecognition {
  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.lang = 'en-US';
    this.onresult = jest.fn();
    this.onerror = jest.fn();
    this.onend = jest.fn();
    this.minConfidence = 0.8;
    this.start = jest.fn(() => {
      this.readyState = 'running';
    });
    this.stop = jest.fn(() => {
      this.readyState = 'stopped';
    });
  }
};

// Mock DOM with proper event handling
document.body.innerHTML = '';

// Mock DOMException and encoding methods
if (typeof window !== 'undefined') {
  global.DOMException = window.DOMException;
  global.btoa = window.btoa;
  global.atob = window.atob;
}

const originalCreateElement = document.createElement.bind(document);
document.createElement = jest.fn((tag) => {
  const element = originalCreateElement(tag);
  if (tag === 'div') {
    element.innerHTML = '';
    element.classList = {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn()
    };
    element.addEventListener = jest.fn();
    element.removeEventListener = jest.fn();
  }
  return element;
});

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  runScripts: 'dangerously'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder; 