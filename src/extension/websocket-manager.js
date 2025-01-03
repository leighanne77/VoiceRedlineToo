class WebSocketManager {
  static ConnectionState = {
    CONNECTING: 'CONNECTING',
    CONNECTED: 'CONNECTED',
    DISCONNECTED: 'DISCONNECTED',
    RECONNECTING: 'RECONNECTING'
  };

  constructor(url) {
    this.url = url;
    this.ws = null;
    this.state = WebSocketManager.ConnectionState.DISCONNECTED;
    this.messageQueue = [];
    this.handlers = new Map();
    this.headers = {
      'Origin': 'https://docs.google.com'
    };
  }

  connect() {
    this.state = WebSocketManager.ConnectionState.CONNECTING;
    this.ws = new WebSocket(this.url, {
      headers: this.headers
    });
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.ws.onopen = () => {
      this.state = WebSocketManager.ConnectionState.CONNECTED;
      this.processMessageQueue();
      const handler = this.handlers.get('open');
      if (handler) handler();
    };

    this.ws.onclose = () => {
      this.state = WebSocketManager.ConnectionState.DISCONNECTED;
    };
  }

  send(message) {
    if (this.state !== WebSocketManager.ConnectionState.CONNECTED) {
      this.messageQueue.push(message);
      return;
    }
    this.ws.send(JSON.stringify(message));
  }

  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }
}

export { WebSocketManager }; 