class DocumentMutationObserver {
  constructor(documentHandler) {
    this.documentHandler = documentHandler;
    this.observer = null;
    this.debounceTimeout = null;
    this.debounceDelay = 500;
    this.setupObserver();
  }

  setupObserver() {
    this.observer = new MutationObserver((mutations) => {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.handleMutations(mutations);
      }, this.debounceDelay);
    });
  }

  handleMutations(mutations) {
    const relevantChanges = mutations.filter(mutation => 
      this.isRelevantMutation(mutation)
    );

    if (relevantChanges.length > 0) {
      this.documentHandler.handleDocumentChanges(relevantChanges);
    }
  }

  isRelevantMutation(mutation) {
    // Filter out non-text changes and extension-initiated changes
    return (
      mutation.type === 'characterData' ||
      (mutation.type === 'childList' && 
       !mutation.target.classList.contains('voice-redline-extension'))
    );
  }

  start() {
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: true
    });
  }

  stop() {
    this.observer.disconnect();
  }
} 