import { WebSocketManager } from '@/extension/websocket-manager';
import config from '@/config/config';

describe('WebSocket Manager', () => {
  let ws;
  let mockWebSocket;
  let originalWebSocket;

  beforeEach(() => {
    jest.useFakeTimers();
    originalWebSocket = global.WebSocket;
    
    mockWebSocket = new originalWebSocket();
    ws = new WebSocketManager(`ws://${config.server.host}:${config.websocket.port}`);
    ws.maxReconnectAttempts = 3;  // Set explicit value
  });

  describe('Connection Management', () => {
    test('should initialize in disconnected state', () => {
      expect(ws.state).toBe(WebSocketManager.ConnectionState.DISCONNECTED);
    });

    test('should include correct CORS headers', () => {
      ws.connect();
      expect(global.WebSocket.lastOptions).toEqual({
        headers: {
          'Origin': 'https://docs.google.com'
        }
      });
    });

    test('should attempt connection', async () => {
      const connectPromise = new Promise(resolve => {
        ws.handlers.set('open', () => resolve());
      });
      
      ws.connect();
      expect(ws.state).toBe(WebSocketManager.ConnectionState.CONNECTING);
      
      mockWebSocket.onopen();
      await connectPromise;
      expect(ws.state).toBe(WebSocketManager.ConnectionState.CONNECTED);
    });

    test('should handle disconnection', () => {
      ws.connect();
      mockWebSocket.onopen();
      mockWebSocket.onclose();
      expect(ws.state).toBe(WebSocketManager.ConnectionState.DISCONNECTED);
    });

    test('should attempt reconnection after disconnect', () => {
      ws.connect();
      mockWebSocket.onclose();
      jest.advanceTimersByTime(1000);
      expect(global.WebSocket).toHaveBeenCalledTimes(2);
    });
  });

  describe('Message Handling', () => {
    test('should queue messages when disconnected', () => {
      const message = { type: 'test', data: 'hello' };
      ws.send(message);
      expect(ws.messageQueue.length).toBe(1);
      expect(ws.messageQueue[0]).toEqual(message);
    });

    test('should send queued messages after connection', () => {
      const message = { type: 'test', data: 'hello' };
      ws.send(message);
      ws.connect();
      mockWebSocket.onopen();
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(message));
      expect(ws.messageQueue.length).toBe(0);
    });

    test('should handle incoming messages', () => {
      const mockHandler = jest.fn();
      ws.handlers.set('test', mockHandler);
      
      const message = { type: 'test', data: 'hello' };
      mockWebSocket.onmessage({ data: JSON.stringify(message) });
      
      expect(mockHandler).toHaveBeenCalledWith(message);
    });

    test('should handle malformed messages', () => {
      const consoleSpy = jest.spyOn(console, 'error');
      mockWebSocket.onmessage({ data: 'invalid json' });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    test('should handle connection errors', () => {
      const error = new Error('Connection failed');
      ws.connect();
      mockWebSocket.onerror(error);
      expect(ws.state).toBe(WebSocketManager.ConnectionState.DISCONNECTED);
    });

    test('should limit reconnection attempts', () => {
      ws.connect();
      for (let i = 0; i <= ws.maxReconnectAttempts; i++) {
        mockWebSocket.onclose();
        jest.advanceTimersByTime(1000);
      }
      expect(global.WebSocket).toHaveBeenCalledTimes(ws.maxReconnectAttempts + 1);
    });
  });

  describe('Security', () => {
    test('should not allow connection without proper origin header', () => {
      ws.headers = { 'Origin': 'https://malicious-site.com' };
      const consoleSpy = jest.spyOn(console, 'error');
      
      ws.connect();
      mockWebSocket.onerror(new Error('Connection refused'));
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(ws.state).toBe(WebSocketManager.ConnectionState.DISCONNECTED);
      
      consoleSpy.mockRestore();
    });

    test('should maintain secure connection state', () => {
      ws.connect();
      mockWebSocket.onopen();
      expect(ws.state).toBe(WebSocketManager.ConnectionState.CONNECTED);
      
      // Simulate security violation
      ws.headers = { 'Origin': 'https://malicious-site.com' };
      mockWebSocket.onclose();
      
      expect(ws.state).toBe(WebSocketManager.ConnectionState.DISCONNECTED);
    });
  });

  describe('Configuration', () => {
    test('should use environment-configured port', () => {
      expect(ws.url).toBe(`ws://${config.server.host}:${process.env.WEBSOCKET_PORT}`);
    });

    test('should handle missing environment variables gracefully', () => {
      const originalPort = process.env.WEBSOCKET_PORT;
      delete process.env.WEBSOCKET_PORT;
      
      const newWs = new WebSocketManager(`ws://${config.server.host}:8765`);
      expect(newWs.url).toContain('8765'); // Default port
      
      process.env.WEBSOCKET_PORT = originalPort;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    global.WebSocket = originalWebSocket;
  });
}); 