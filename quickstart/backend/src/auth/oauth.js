const crypto = require('crypto');

// PKCE Utilities
const toUrlSafe = (base64) => base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

const generateCodeVerifier = () => {
  return toUrlSafe(crypto.randomBytes(32).toString('base64'));
};

const generateCodeChallenge = (verifier) => {
  return toUrlSafe(crypto.createHash('sha256').update(verifier).digest('base64'));
};

module.exports = {
  toUrlSafe,
  generateCodeVerifier,
  generateCodeChallenge
};