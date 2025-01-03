document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const suggestBtn = document.getElementById('suggestBtn');
  const acceptBtn = document.getElementById('acceptBtn');
  const clearBtn = document.getElementById('clearBtn');
  const acceptAllBtn = document.getElementById('acceptAllBtn');
  const connectionStatus = document.getElementById('connection-status');
  const docStatus = document.getElementById('doc-status');
  const voiceIndicator = document.getElementById('voice-indicator');

  let port = chrome.runtime.connect({ name: 'popup' });

  function updateStatus(isConnected) {
    connectionStatus.textContent = isConnected ? '🟢 Connected' : '⚪ Disconnected';
    startBtn.disabled = !isConnected;
  }

  function updateDocStatus(hasDoc) {
    docStatus.textContent = hasDoc ? 'Document detected' : 'No document detected';
  }

  startBtn.addEventListener('click', () => {
    port.postMessage({ command: 'start' });
    startBtn.disabled = true;
    stopBtn.disabled = false;
    suggestBtn.disabled = false;
    voiceIndicator.style.color = '#4285f4';
  });

  stopBtn.addEventListener('click', () => {
    port.postMessage({ command: 'stop' });
    startBtn.disabled = false;
    stopBtn.disabled = true;
    suggestBtn.disabled = true;
    voiceIndicator.style.color = 'initial';
  });

  // Add other button event listeners...

  port.onMessage.addListener((msg) => {
    switch (msg.type) {
      case 'connection':
        updateStatus(msg.connected);
        break;
      case 'document':
        updateDocStatus(msg.hasDocument);
        break;
      case 'suggestion':
        // Handle new suggestion...
        break;
    }
  });
}); 