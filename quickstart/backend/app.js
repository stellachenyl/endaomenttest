require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const fetch = require('node-fetch');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cookieParser());

function toUrlSafe(base64) {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

// Generate code verifier and challenge
function generateCodeVerifier() {
    const randomBytes = crypto.randomBytes(32);
    return toUrlSafe(randomBytes.toString('base64'));
}

async function generateCodeChallenge(codeVerifier) {
    const hash = crypto.createHash('sha256');
    hash.update(codeVerifier);
    return toUrlSafe(hash.digest('base64'));
}

function saveOAuthState({ codeVerifier, codeChallenge, state }) {
    const filePath = path.join(__dirname, 'oauth_state.json');
    fs.writeFileSync(filePath, JSON.stringify({ codeVerifier, codeChallenge, state }, null, 2));
}

// Endpoint to initiate login
app.post('/init-login', async (req, res) => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = crypto.randomBytes(16).toString('hex');
  
    saveOAuthState({ codeVerifier, codeChallenge, state });
  
    const redirectUri = 'http://localhost:5454/verify-login';  // Ensure this matches your OAuth redirect URI
    const urlParams = new URLSearchParams({
      response_type: 'code',
      prompt: 'consent',
      scope: 'openid offline_access accounts transactions profile',
      client_id: process.env.ENDAOMENT_CLIENT_ID,
      redirect_uri: redirectUri,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: state,
    });
  
    const authUrl = `https://auth.endaoment.org/auth?${urlParams.toString()}`;
    res.json({ url: authUrl });
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5454;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});