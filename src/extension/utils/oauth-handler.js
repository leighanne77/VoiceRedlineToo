/**
 * OAuth handler for Google authentication and document access
 */
export class OAuthHandler {
  constructor(config) {
    this.config = config;
    this.token = null;
  }

  async initialize() {
    try {
      this.token = await this.getAuthToken();
      return true;
    } catch (error) {
      console.error('OAuth initialization failed:', error);
      return false;
    }
  }

  async getAuthToken() {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(token);
        }
      });
    });
  }

  async refreshToken() {
    return new Promise((resolve, reject) => {
      chrome.identity.removeCachedAuthToken({ token: this.token }, async () => {
        try {
          this.token = await this.getAuthToken();
          resolve(this.token);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
} 