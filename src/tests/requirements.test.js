import { VoiceRecognitionHandler } from '@/extension/voice-recognition';
import { DocumentHandler } from '@/extension/content';
import config from '@/config/config';

describe('Core Requirements', () => {
  let originalEnv;

  beforeEach(() => {
    jest.clearAllMocks();
    // Save original env before each test
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    jest.resetModules();
    // Restore original env after each test
    process.env = { ...originalEnv };
  });

  describe('Environment Variables', () => {
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

    test.each(requiredVars)('should have required env var: %s', (varName) => {
      expect(process.env[varName]).toBeDefined();
      expect(process.env[varName]).not.toBe('');
    });

    test('should handle missing optional variables', () => {
      const optionalVar = process.env.OPTIONAL_VAR;
      delete process.env.OPTIONAL_VAR;
      
      const handler = new DocumentHandler();
      expect(handler).toBeDefined();
      
      if (optionalVar) {
        process.env.OPTIONAL_VAR = optionalVar;
      }
    });
  });

  describe('Configuration', () => {
    test('should load correct environment config', () => {
      expect(config.env).toBe('test');
      expect(config.debug).toBeDefined();
      expect(config.oauth).toBeDefined();
      expect(config.oauth.clientId).toBeDefined();
      if (process.env.GOOGLE_CLIENT_SECRET) {
        expect(config.oauth.clientSecret).toBeDefined();
      }
      expect(config.oauth.apiKey).toBeDefined();
      expect(config.oauth.scopes).toBeInstanceOf(Array);
      expect(config.oauth.discoveryDocs).toBeInstanceOf(Array);
    });
  });
});