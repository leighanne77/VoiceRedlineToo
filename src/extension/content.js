const config = require('../config/config');
const { RateLimiter } = require('./utils/rate-limiter');
const { OAuthHandler } = require('./utils/oauth-handler');
const { VoiceRecognitionHandler } = require('./voice-recognition');

class DocumentHandler {
  constructor() {
    this.websocket = null;
    this.currentParagraph = null;
    this.suggestions = new Map();
    this.rateLimiter = new RateLimiter({
      voice: {
        maxTokens: 60,    // 60 voice commands per minute
        refillRate: 1     // 1 token per second
      },
      api: {
        maxTokens: 100,   // 100 API calls per minute
        refillRate: 1.67  // Refill rate for smooth distribution
      }
    });
    
    this.voiceCommands = new Set([
      "start redlining",
      "stop redlining",
      "move cursor up",
      "move cursor down",
      "go forward",
      "go forward two",
      "make suggestion",
      "Accept Suggested",
      "Clear markup, restore original",
      "Accept All, Move to Final"
    ]);
    
    this.auth = new OAuthHandler(config);
    
    this.changeLog = [];
    
    this.voiceHandler = new VoiceRecognitionHandler({
      defaultLanguage: config.defaultLanguage || 'en-US'
    });
    
    this.init();
  }

  async init() {
    try {
      await this.auth.initialize();
      this.setupWebSocket();
      this.setupMutationObserver();
      this.setupVoiceRecognition();
    } catch (error) {
      console.error('Authentication failed:', error);
      // Handle auth failure
    }
  }

  setupWebSocket() {
    this.websocket = new WebSocket(`ws://${config.server.host}:${config.websocket.port}`);
    
    this.websocket.onopen = () => {
      console.log('Connected to voice processing server');
    };

    this.websocket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      await this.handleServerMessage(data);
    };

    // Implement reconnection logic
    this.websocket.onclose = () => {
      setTimeout(() => this.setupWebSocket(), 1000);
    };
  }

  setupMutationObserver() {
    this.handleDocumentChanges = this.handleDocumentChanges.bind(this);
    const observer = new MutationObserver(this.handleDocumentChanges);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  handleDocumentChanges(mutations) {
    mutations.forEach(mutation => {
      if (mutation.type === 'characterData' || 
         (mutation.type === 'childList' && 
          !mutation.target.classList.contains('voice-redline-extension'))) {
        this.processMutation(mutation);
      }
    });
  }

  processMutation(mutation) {
    if (mutation.type === 'characterData') {
      const node = mutation.target;
      const text = node.textContent;
      this.handleTextChange(text, node);
    }
  }

  handleTextChange(text, node) {
    console.log('Text changed:', text);
  }

  async handleServerMessage(data) {
    try {
      // Check rate limit for API calls
      await this.rateLimiter.acquire('api');
      
      switch (data.type) {
        case 'suggestion':
          await this.applySuggestion(data.suggestion, data.paragraph);
          break;
        case 'command':
          await this.handleVoiceCommand(data.command);
          break;
        case 'error':
          this.handleError(data.error);
          break;
      }
    } catch (error) {
      if (error.waitTime) {
        this.notifyRateLimit(error);
      } else {
        console.error('Error processing server message:', error);
      }
    }
  }

  async applySuggestion(suggestion, paragraphId) {
    try {
      const paragraph = this.findParagraphById(paragraphId);
      if (!paragraph) throw new Error('Paragraph not found');

      const range = document.createRange();
      range.selectNodeContents(paragraph);

      const highlightedContent = this.createHighlightedContent(
        paragraph.textContent,
        suggestion
      );

      // Store original content for restoration
      this.suggestions.set(paragraphId, {
        original: paragraph.textContent,
        suggested: suggestion,
        highlighted: highlightedContent
      });

      // Update UI with preview
      this.updatePreviewPanel(paragraphId);
    } catch (error) {
      console.error('Error applying suggestion:', error);
    }
  }

  async handleVoiceInput(transcript) {
    try {
      // Check rate limit for voice commands
      await this.rateLimiter.acquire('voice');
      
      if (this.voiceCommands.has(transcript)) {
        await this.handleVoiceCommand(transcript);
      } else {
        await this.handlePotentialSuggestion(transcript);
      }
    } catch (error) {
      if (error.waitTime) {
        this.notifyRateLimit(error);
      } else {
        console.error('Error processing voice input:', error);
      }
    }
  }

  notifyRateLimit(error) {
    const status = this.rateLimiter.getStatus(error.type);
    const waitTime = Math.ceil(error.waitTime / 1000);
    
    console.warn(`Rate limit reached for ${error.type}. Please wait ${waitTime} seconds.`);
    // Trigger UI notification through preview panel
    this.updatePreviewPanel({
      type: 'rate-limit',
      message: `Rate limit reached. Please wait ${waitTime} seconds.`,
      status
    });
  }

  logChange(change) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      type: change.type,
      original: change.original,
      modified: change.modified,
      paragraph: change.paragraphId
    };
    this.changeLog.push(logEntry);
    this.updateAppendix();
  }

  updateAppendix() {
    let appendixContent = '# Document Change Log\n\n';
    this.changeLog.forEach(entry => {
      appendixContent += `## ${entry.timestamp}\n`;
      appendixContent += `- Type: ${entry.type}\n`;
      appendixContent += `- Original: "${entry.original}"\n`;
      appendixContent += `- Modified: "${entry.modified}"\n\n`;
    });

    // Find or create appendix section
    let appendixSection = document.querySelector('.voice-redline-appendix');
    if (!appendixSection) {
      appendixSection = document.createElement('div');
      appendixSection.className = 'voice-redline-appendix';
      document.body.appendChild(appendixSection);
    }
    appendixSection.innerHTML = appendixContent;
  }

  setLanguage(languageCode) {
    return this.voiceHandler.setLanguage(languageCode);
  }

  // ... More implementation details to follow
}

// Initialize the handler
const handler = new DocumentHandler();

export { DocumentHandler }; 