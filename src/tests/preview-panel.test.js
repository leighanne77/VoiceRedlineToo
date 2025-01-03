import { PreviewPanelManager } from '@/extension/preview-panel';
import config from '../config/config';

describe('Preview Panel Manager', () => {
  let manager;
  let container;

  beforeEach(() => {
    // Setup DOM environment
    container = document.createElement('div');
    container.id = 'suggestions-container';
    document.body.appendChild(container);
    
    manager = new PreviewPanelManager();
  });

  describe('Panel Initialization', () => {
    test('should create preview panel with correct structure', () => {
      expect(container).not.toBeNull();
      expect(manager.activePreviews.size).toBe(0);
      expect(manager.maxPreviews).toBe(5);
    });

    test('should handle missing container gracefully', () => {
      document.body.removeChild(container);
      const newManager = new PreviewPanelManager();
      expect(() => newManager.addPreview({ original: 'test' }, 'p1')).not.toThrow();
    });
  });

  describe('Preview Management', () => {
    test('should add preview correctly', () => {
      const suggestion = {
        original: 'Hello world',
        suggested: 'Hello beautiful world'
      };
      
      manager.addPreview(suggestion, 'p1');
      const preview = container.querySelector('.suggestion-preview');
      
      expect(preview).not.toBeNull();
      expect(preview.dataset.paragraphId).toBe('p1');
      expect(manager.activePreviews.has('p1')).toBe(true);
    });

    test('should enforce maximum preview limit', () => {
      // Add more than max allowed previews
      for (let i = 0; i < 6; i++) {
        manager.addPreview({
          original: `text ${i}`,
          suggested: `new text ${i}`
        }, `p${i}`);
      }
      
      expect(manager.activePreviews.size).toBe(5);
      expect(manager.activePreviews.has('p0')).toBe(false);
      expect(manager.activePreviews.has('p5')).toBe(true);
    });

    test('should update existing preview', () => {
      const original = {
        original: 'Hello world',
        suggested: 'Hello beautiful world'
      };
      
      const updated = {
        original: 'Hello world',
        suggested: 'Hello amazing world'
      };
      
      manager.addPreview(original, 'p1');
      manager.addPreview(updated, 'p1');
      
      const preview = container.querySelector('.suggestion-preview');
      expect(preview.textContent).toContain('amazing');
      expect(manager.activePreviews.size).toBe(1);
    });
  });

  describe('Preview Interaction', () => {
    test('should handle accept action', () => {
      const suggestion = {
        original: 'Hello world',
        suggested: 'Hello beautiful world'
      };
      
      manager.addPreview(suggestion, 'p1');
      const acceptButton = container.querySelector('.accept-button');
      
      const mockAcceptHandler = jest.fn();
      manager.onAccept = mockAcceptHandler;
      
      acceptButton.click();
      expect(mockAcceptHandler).toHaveBeenCalledWith('p1');
      expect(manager.activePreviews.has('p1')).toBe(false);
    });

    test('should handle clear action', () => {
      const suggestion = {
        original: 'Hello world',
        suggested: 'Hello beautiful world'
      };
      
      manager.addPreview(suggestion, 'p1');
      const clearButton = container.querySelector('.clear-button');
      
      const mockClearHandler = jest.fn();
      manager.onClear = mockClearHandler;
      
      clearButton.click();
      expect(mockClearHandler).toHaveBeenCalledWith('p1');
      expect(manager.activePreviews.has('p1')).toBe(false);
    });

    test('should handle keyboard shortcuts', () => {
      const suggestion = {
        original: 'Hello world',
        suggested: 'Hello beautiful world'
      };
      
      manager.addPreview(suggestion, 'p1');
      
      // Simulate keyboard event
      const event = new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true });
      document.dispatchEvent(event);
      
      expect(manager.activePreviews.has('p1')).toBe(false);
    });

    test('should handle rapid interactions', () => {
      const suggestion = {
        original: 'Hello world',
        suggested: 'Hello beautiful world'
      };
      
      // Rapid add/remove
      for (let i = 0; i < 10; i++) {
        manager.addPreview(suggestion, 'p1');
        manager.removePreview('p1');
      }
      
      expect(manager.activePreviews.size).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid suggestion data', () => {
      const consoleSpy = jest.spyOn(console, 'error');
      manager.addPreview(null, 'p1');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should handle missing paragraph ID', () => {
      const suggestion = {
        original: 'Hello world',
        suggested: 'Hello beautiful world'
      };
      
      expect(() => manager.addPreview(suggestion)).not.toThrow();
      expect(manager.activePreviews.size).toBe(0);
    });
  });

  describe('Environment Configuration', () => {
    test('should respect debug mode setting', () => {
      // Create a new container for each test
      const testContainer = document.createElement('div');
      document.body.appendChild(testContainer);

      const debugMode = process.env.DEBUG === 'true';
      const manager = new PreviewPanelManager({ 
        debug: debugMode,
        container: testContainer 
      });
      expect(manager.debug).toBe(debugMode);

      // Cleanup
      document.body.removeChild(testContainer);
    });
  });

  afterEach(() => {
    // Cleanup DOM
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    jest.clearAllMocks();
  });
}); 