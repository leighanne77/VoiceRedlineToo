const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const dotenv = require('dotenv');
const config = require('../../config/config').default;

function packageExtension() {
  // Load environment variables
  dotenv.config();

  const zip = new AdmZip();
  const outputPath = path.join(__dirname, '../../dist');
  const manifestPath = path.join(__dirname, '../../manifest.json');

  // Read and process manifest
  let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  // Replace environment variables in manifest
  manifest.oauth2.client_id = `${config.oauth.clientId}.apps.googleusercontent.com`;
  manifest.oauth2.scopes = config.oauth.scopes;
  
  // Add files to zip
  zip.addLocalFile(path.join(__dirname, '../../src/extension/content.js'));
  zip.addLocalFile(path.join(__dirname, '../../src/extension/background.js'));
  zip.addLocalFile(path.join(__dirname, '../../src/styles/content.css'));
  
  // Add processed manifest
  zip.addFile('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2)));

  // Create dist directory if it doesn't exist
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
  }

  // Write the zip file
  zip.writeZip(path.join(outputPath, 'extension.zip'));
}

packageExtension(); 