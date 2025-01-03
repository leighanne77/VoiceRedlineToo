const AdmZip = require('adm-zip');
const LRUCache = require('lru-cache');
const path = require('path');

const cache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 5
});

async function packageExtension() {
  const zip = new AdmZip();
  
  // Add files to zip
  zip.addLocalFolder(path.join(__dirname, '../src/extension'), 'extension');
  
  // Write zip file
  zip.writeZip(path.join(__dirname, '../dist/extension.zip'));
}

module.exports = packageExtension; 