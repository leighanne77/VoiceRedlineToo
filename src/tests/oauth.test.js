import { OAuthHandler } from '@/extension/utils/oauth-handler';
import config from '@/config/config';

describe('OAuth Handler', () => {
  let handler;
  let originalEnv;

  beforeAll(() => {
    // Skip all OAuth tests if secret is missing
    if (!process.env.GOOGLE_CLIENT_SECRET) {
      console.warn('Skipping OAuth tests - GOOGLE_CLIENT_SECRET not set');
    }
  });

  beforeEach(() => {
    originalEnv = { ...process.env };
    handler = new OAuthHandler(config);
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
  });

  describe('Initialization', () => {
    test.skipIf(!process.env.GOOGLE_CLIENT_SECRET)('should initialize with valid credentials', async () => {
      const result = await handler.initialize();
      expect(result).toBe(true);
      expect(handler.token).toBeDefined();
      expect(chrome.identity.getAuthToken).toHaveBeenCalledWith(
        { interactive: true },
        expect.any(Function)
      );
    });

    test('should fail initialization with invalid credentials', async () => {
      process.env.GOOGLE_CLIENT_ID = '';
      process.env.GOOGLE_CLIENT_SECRET = '';
      
      const result = await handler.initialize();
      expect(result).toBe(false);
      expect(handler.token).toBeNull();
    });
  });

  describe('Token Management', () => {
    test('should handle token refresh', async () => {
      await handler.initialize();
      const oldToken = handler.token;
      
      await handler.refreshToken();
      expect(handler.token).toBeDefined();
      expect(handler.token).not.toBe(oldToken);
      expect(chrome.identity.removeCachedAuthToken).toHaveBeenCalledWith(
        { token: oldToken },
        expect.any(Function)
      );
    });

    test('should handle token refresh failure', async () => {
      await handler.initialize();
      const oldToken = handler.token;
      
      chrome.identity.getAuthToken.mockImplementationOnce((_, callback) => {
        callback(undefined);
        chrome.runtime.lastError = new Error('Refresh failed');
      });

      await expect(handler.refreshToken()).rejects.toThrow();
      expect(handler.token).toBe(oldToken);
    });
  });

  describe('Error Handling', () => {
    test('should handle chrome.runtime.lastError', async () => {
      chrome.identity.getAuthToken.mockImplementationOnce((_, callback) => {
        callback(undefined);
        chrome.runtime.lastError = new Error('Auth failed');
      });

      const result = await handler.initialize();
      expect(result).toBe(false);
      expect(handler.token).toBeNull();
    });

    test('should handle network errors', async () => {
      chrome.identity.getAuthToken.mockImplementationOnce(() => {
        throw new Error('Network error');
      });

      const result = await handler.initialize();
      expect(result).toBe(false);
      expect(handler.token).toBeNull();
    });
  });

  describe('Configuration', () => {
    test('should use correct OAuth scopes', () => {
      expect(config.oauth.scopes).toContain('https://www.googleapis.com/auth/docs');
      expect(config.oauth.scopes).toContain('https://www.googleapis.com/auth/drive.file');
    });

    test('should handle missing optional configuration', () => {
      const minimalConfig = {
        oauth: {
          clientId: 'test-id',
          apiKey: 'test-key'
        }
      };
      
      const minimalHandler = new OAuthHandler(minimalConfig);
      expect(minimalHandler).toBeDefined();
    });
  });
}); 