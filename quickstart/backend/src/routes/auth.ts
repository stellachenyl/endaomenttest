import { Router } from 'express';
import { generateCodeVerifier, generateCodeChallenge } from '../auth/oauth';

const router = Router();
const stateStore = new Map(); // Use Redis in production

router.post('/init-login', (req, res) => {
  const codeVerifier = generateCodeVerifier();
  const state = crypto.randomBytes(16).toString('hex');
  
  stateStore.set(state, { 
    codeVerifier,
    createdAt: Date.now() 
  });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.ENDAOMENT_CLIENT_ID!,
    redirect_uri: `${process.env.SAFE_BACKEND_URL}/auth/callback`,
    code_challenge: generateCodeChallenge(codeVerifier),
    code_challenge_method: 'S256',
    state,
    scope: 'openid offline_access accounts transactions profile'
  });

  res.json({ 
    url: `https://auth.endaoment.org/auth?${params.toString()}`
  });
});

