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

router.get('/auth/callback', async (req, res) => {
    const { code, state } = req.query;
    
    if (!state || !stateStore.has(state as string)) {
      return res.status(400).send('Invalid state parameter');
    }
  
    const { codeVerifier } = stateStore.get(state as string);
    stateStore.delete(state as string);
  
    const tokenResponse = await fetch('https://auth.endaoment.org/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.ENDAOMENT_CLIENT_ID}:${process.env.ENDAOMENT_CLIENT_SECRET}`
        ).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: `${process.env.SAFE_BACKEND_URL}/auth/callback`,
        code_verifier: codeVerifier
      })
    });
  
    const tokens = await tokenResponse.json();
    
    // Set secure, HTTP-only cookies
    res.cookie('access_token', tokens.access_token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    res.redirect(process.env.SAFE_FRONTEND_URL || '/');
  });
  
  export default router;