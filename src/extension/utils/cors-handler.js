/**
 * CORS configuration and handling
 */
const ALLOWED_ORIGINS = [
  'https://docs.google.com',
  'https://docs.google.com/document',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null
].filter(Boolean);

const ALLOWED_METHODS = ['GET', 'POST', 'OPTIONS'];
const ALLOWED_HEADERS = ['Content-Type', 'Authorization'];

export const corsHandler = (req, res) => {
  const origin = req.headers.origin;

  // Check if origin is allowed
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS.join(', '));
      res.setHeader('Access-Control-Allow-Headers', ALLOWED_HEADERS.join(', '));
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
      res.end();
      return true;
    }
  }
  return false;
}; 