export class PreviewPanelManager {
  constructor(options = {}) {
    this.debug = options.debug || false;
    this.container = options.container || document.getElementById('suggestions-container');
    this.activePreviews = new Map();
    this.maxPreviews = 5;
    this.onAccept = null;
    this.onClear = null;
  }

  // Add other methods that are being tested
  addPreview(suggestion, paragraphId) {
    if (this.activePreviews.has(paragraphId)) {
      this.updatePreview(suggestion, paragraphId);
      return;
    }

    if (this.activePreviews.size >= this.maxPreviews) {
      const firstKey = Array.from(this.activePreviews.keys())[0];
      this.removePreview(firstKey);
    }

    const previewElement = this.createPreviewElement(suggestion, paragraphId);
    this.activePreviews.set(paragraphId, previewElement);
  }

  removePreview(paragraphId) {
    const preview = this.activePreviews.get(paragraphId);
    if (preview) {
      preview.remove();
      this.activePreviews.delete(paragraphId);
    }
  }

  createPreviewElement(suggestion, paragraphId) {
    const element = document.createElement('div');
    element.classList.add('preview-panel');
    element.dataset.paragraphId = paragraphId;
    
    element.innerHTML = `
      <div class="preview-header">
        <span>Suggestion</span>
        <div class="preview-actions">
          <button class="accept">Accept</button>
          <button class="clear">Clear</button>
        </div>
      </div>
      <div class="preview-content">
        ${suggestion}
      </div>
    `;

    // Add event listeners
    element.querySelector('.accept').addEventListener('click', () => {
      if (this.onAccept) this.onAccept(paragraphId);
    });

    element.querySelector('.clear').addEventListener('click', () => {
      if (this.onClear) this.onClear(paragraphId);
    });

    return element;
  }
} 