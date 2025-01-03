class ErrorHandler {
  static ErrorTypes = {
    VOICE_RECOGNITION: 'VOICE_RECOGNITION',
    WEBSOCKET: 'WEBSOCKET',
    DOCUMENT_MUTATION: 'DOCUMENT_MUTATION',
    API: 'API',
    UNKNOWN: 'UNKNOWN'
  };

  static ErrorSeverity = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
  };

  constructor() {
    this.errorLog = new Map();
    this.errorCallbacks = new Set();
  }

  handleError(error, type = ErrorHandler.ErrorTypes.UNKNOWN) {
    const errorInfo = this.categorizeError(error, type);
    this.logError(errorInfo);
    this.notifyListeners(errorInfo);
    this.takeAction(errorInfo);
  }

  categorizeError(error, type) {
    return {
      timestamp: new Date(),
      type,
      message: error.message,
      stack: error.stack,
      severity: this.determineSeverity(error, type)
    };
  }

  determineSeverity(error, type) {
    switch (type) {
      case ErrorHandler.ErrorTypes.VOICE_RECOGNITION:
        return ErrorHandler.ErrorSeverity.MEDIUM;
      case ErrorHandler.ErrorTypes.WEBSOCKET:
        return ErrorHandler.ErrorSeverity.HIGH;
      case ErrorHandler.ErrorTypes.API:
        return ErrorHandler.ErrorSeverity.HIGH;
      default:
        return ErrorHandler.ErrorSeverity.LOW;
    }
  }

  takeAction(errorInfo) {
    if (errorInfo.severity === ErrorHandler.ErrorSeverity.CRITICAL) {
      this.handleCriticalError(errorInfo);
    }
  }
} 