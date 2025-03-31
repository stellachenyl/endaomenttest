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

function getOAuthState(stateFromUrl) {
  // Load the exported variables from the file, session, or database
  // The specific implementation will be up to your team and the requirements of your application
  return JSON.parse(
    // Remember that in the case of a state mismatch, this file will not exist
    // You should handle this case by returning an error
    fs.readFileSync(
      path.join(__dirname, `${stateFromUrl}-exportedVariables.json`),
      'utf8'
    )
  );
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

// Endpoint to verify login and exchange code for token
app.get('/verify-login', async (req, res) => {
    const { state, code } = req.query;
    const filePath = path.join(__dirname, 'oauth_state.json');
    const { codeVerifier, redirectUri } = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
    if (state !== state) {
      return res.status(400).send('State mismatch');
    }
  
    const formData = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
    });
  
    const tokenResponse = await fetch('https://auth.endaoment.org/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${process.env.ENDAOMENT_CLIENT_ID}:${process.env.ENDAOMENT_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: formData,
    });
  
    const tokenData = await tokenResponse.json();
    // Store the token securely
    res.json(tokenData); // Send the token data back to the frontend (optional, you can also store it server-side)
  });

  app.get('/dev/token', async (req, res) => {
    const { state, code } = req.query;
  
    // Load the stored variables for the state (codeVerifier, etc.)
    const exportedVariables = getOAuthState(state);
  
    // Validate the state parameter to prevent CSRF attacks
    if (!state || state !== exportedVariables.state) {
      return res.status(400).json({ error: 'State mismatch' });
    }
  
    // Prepare the form data for the token exchange request
    const formData = new URLSearchParams();
    formData.append('grant_type', 'authorization_code');
    formData.append('code', code); // The authorization code from the URL
    formData.append('code_verifier', exportedVariables.codeVerifier); // Code verifier from the initial login
    formData.append('redirect_uri', 'http://localhost:5454/dev/token'); // The same redirect URI used during the OAuth flow
  
    // Send the token request to the Endaoment API
    const tokenResponse = await fetch('https://auth.endaoment.org/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.ENDAOMENT_CLIENT_ID}:${process.env.ENDAOMENT_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: formData,
    });
  
    const tokenData = await tokenResponse.json();
    console.log('Access Token Response:', tokenData);
  
    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error });
    }
  
    // Now that we have the access token, store it securely (in a session or database)
    // Here, we'll just send it back as a response (in real-world apps, avoid sending tokens in responses)
  
    res.json(tokenData);  // Send back the token response, or store it securely in your backend
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