import { VoiceRecognitionHandler } from '../extension/voice-recognition';
import config from '../config/config';

describe('Voice Recognition Handler', () => {
  let handler;
  let mockConfig;
  let mockRecognition;
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Mock recognition instance
    mockRecognition = {
      start: jest.fn(),
      stop: jest.fn(),
      onresult: null,
      onerror: null,
      onend: null,
      continuous: false,
      interimResults: false,
      lang: 'en-US'
    };

    // Mock the Web Speech API
    global.webkitSpeechRecognition = jest.fn(() => mockRecognition);

    // Mock configuration with document handler
    mockConfig = {
      defaultLanguage: 'en-US',
      documentHandler: {
        voiceCommands: new Set([
          'start redlining',
          'stop redlining',
          'move cursor up',
          'move cursor down',
          'go forward',
          'go forward two',
          'make suggestion',
          'Accept Suggested',
          'Clear markup, restore original',
          'Accept All, Move to Final'
        ]),
        handleVoiceCommand: jest.fn(),
        handlePotentialSuggestion: jest.fn()
      }
    };

    handler = new VoiceRecognitionHandler(mockConfig);
  });

  describe('Initialization', () => {
    test('should initialize with correct default values', () => {
      expect(handler.isListening).toBe(false);
      expect(handler.confidenceThreshold).toBe(0.8);
      expect(handler.currentLanguage).toBe('en-US');
      expect(global.webkitSpeechRecognition).toHaveBeenCalled();
    });

    test('should throw error if speech recognition is not supported', () => {
      global.webkitSpeechRecognition = undefined;
      expect(() => new VoiceRecognitionHandler(mockConfig)).toThrow('Speech recognition not supported');
    });
  });

  describe('Voice Recognition Controls', () => {
    test('should start voice recognition', () => {
      handler.start();
      expect(handler.isListening).toBe(true);
      expect(mockRecognition.start).toHaveBeenCalled();
    });

    test('should stop voice recognition', () => {
      handler.start();
      handler.stop();
      expect(handler.isListening).toBe(false);
      expect(mockRecognition.stop).toHaveBeenCalled();
    });

    test('should auto-restart on recognition end if still listening', () => {
      handler.start();
      mockRecognition.onend();
      expect(mockRecognition.start).toHaveBeenCalledTimes(2);
    });
  });

  describe('Voice Command Handling', () => {
    test('should handle valid voice commands', () => {
      const command = 'start redlining';
      handler.handleVoiceInput(command);
      expect(mockConfig.documentHandler.handleVoiceCommand)
        .toHaveBeenCalledWith(command);
      expect(mockConfig.documentHandler.handlePotentialSuggestion)
        .not.toHaveBeenCalled();
    });

    test('should handle non-command input as suggestions', () => {
      const suggestion = 'this is a suggestion';
      handler.handleVoiceInput(suggestion);
      expect(mockConfig.documentHandler.handleVoiceCommand)
        .not.toHaveBeenCalled();
      expect(mockConfig.documentHandler.handlePotentialSuggestion)
        .toHaveBeenCalledWith(suggestion);
    });

    test('should handle voice recognition results', () => {
      const mockResult = {
        results: [[{
          transcript: 'start redlining',
          confidence: 0.9
        }]],
        resultIndex: 0
      };
      mockRecognition.onresult(mockResult);
      expect(mockConfig.documentHandler.handleVoiceCommand)
        .toHaveBeenCalledWith('start redlining');
    });

    test('should ignore results below confidence threshold', () => {
      const mockResult = {
        results: [[{
          transcript: 'start redlining',
          confidence: 0.5
        }]],
        resultIndex: 0
      };
      mockRecognition.onresult(mockResult);
      expect(mockConfig.documentHandler.handleVoiceCommand)
        .not.toHaveBeenCalled();
    });
  });

  describe('Language Support', () => {
    test('should support language switching', () => {
      expect(handler.setLanguage('es-ES')).toBe(true);
      expect(handler.currentLanguage).toBe('es-ES');
      expect(mockRecognition.lang).toBe('es-ES');
    });

    test('should reject invalid language codes', () => {
      expect(handler.setLanguage('invalid-code')).toBe(false);
      expect(handler.currentLanguage).toBe('en-US');
      expect(mockRecognition.lang).toBe('en-US');
    });

    test('should handle translated commands', () => {
      handler.setLanguage('es-ES');
      const translatedCommand = handler.getTranslatedCommand('start redlining');
      expect(translatedCommand).toBe('comenzar redline');
    });
  });

  describe('Error Handling', () => {
    test('should handle recognition errors', () => {
      const mockError = { error: 'no-speech' };
      const consoleSpy = jest.spyOn(console, 'error');
      mockRecognition.onerror(mockError);
      expect(consoleSpy).toHaveBeenCalledWith('Speech recognition error:', mockError);
      consoleSpy.mockRestore();
    });

    test('should handle network errors', () => {
      const networkError = new Error('Network error');
      mockRecognition.onerror({ error: networkError });
      expect(consoleSpy).toHaveBeenCalledWith('Speech recognition error:', expect.any(Object));
    });

    test('should handle no speech input', () => {
      mockRecognition.onerror({ error: 'no-speech' });
      expect(consoleSpy).toHaveBeenCalledWith('Speech recognition error:', expect.any(Object));
    });
  });

  describe('API Integration', () => {
    test('should use configured API key', () => {
      expect(process.env.GROQ_API_KEY).toBeDefined();
      expect(config.groq.apiKey).toBe(process.env.GROQ_API_KEY);
    });

    test('should handle API errors gracefully', async () => {
      const originalKey = process.env.GROQ_API_KEY;
      process.env.GROQ_API_KEY = 'invalid_key';
      
      const consoleSpy = jest.spyOn(console, 'error');
      await handler.handleVoiceInput('make suggestion');
      
      expect(consoleSpy).toHaveBeenCalled();
      process.env.GROQ_API_KEY = originalKey;
      consoleSpy.mockRestore();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockRestore();
  });
}); 