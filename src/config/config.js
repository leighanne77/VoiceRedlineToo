require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  debug: process.env.DEBUG === 'true',
  server: {
    host: process.env.SERVER_HOST || 'localhost',
    port: parseInt(process.env.SERVER_PORT, 10) || 3000
  },
  websocket: {
    port: parseInt(process.env.WEBSOCKET_PORT, 10) || 8765
  },
  oauth: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    apiKey: process.env.GOOGLE_DOCS_API_KEY,
    scopes: [
      'https://www.googleapis.com/auth/docs',
      'https://www.googleapis.com/auth/drive.file'
    ],
    discoveryDocs: [
      'https://docs.googleapis.com/$discovery/rest?version=v1'
    ]
  },
  extension: {
    id: process.env.CHROME_EXTENSION_ID
  }
};

if (config.debug) {
  console.log('Debug mode enabled');
}

export default config; 