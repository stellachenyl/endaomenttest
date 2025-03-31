const express = require('express');
const router = express.Router();
const { generateCodeVerifier, generateCodeChallenge } = require('./auth/oauth');

// In-memory store (use Redis in production)
const stateStore = new Map();

router.post('/init-login', (req, res) => {
  const codeVerifier = generateCodeVerifier();
  const state = crypto.randomBytes(16).toString('hex');
  
  stateStore.set(state, {
    codeVerifier,
    createdAt: Date.now()
  });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.ENDAOMENT_CLIENT_ID,
    redirect_uri: process.env.REDIRECT_URI,
    code_challenge: generateCodeChallenge(codeVerifier),
    code_challenge_method: 'S256',
    state: state,
    scope: 'openid offline_access accounts transactions profile'
  });

  res.json({
    url: `https://auth.endaoment.org/auth?${params}`
  });
});

module.exports = router;