import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { ACCESS_TOKEN_NAME } from '../utils/access-token';
import { getEndaomentUrls } from '../utils/endaoment-urls';
import { getEnvOrThrow } from '../utils/env';

export const verifyLogin = async (req: Request, res: Response) => {
  const stateFromUrl = req.query['state'];
  const code = req.query['code'];
  if (
    !stateFromUrl ||
    !code ||
    typeof stateFromUrl !== 'string' ||
    typeof code !== 'string'
  ) {
    res.status(400);
    res.send('Missing state or code');
    res.end();
    return;
  }

  const exportedVariables = JSON.parse(
    fs.readFileSync(
      path.join(
        import.meta.dirname,
        '../../login-states/',
        `${stateFromUrl}-exportedVariables.json`
      ),
      'utf8'
    )
  );

  const staticUrl = `${getEndaomentUrls().auth}/token`;
  const formData = new URLSearchParams();
  formData.append('grant_type', 'authorization_code');
  formData.append('code', code);
  formData.append('code_verifier', exportedVariables.codeVerifier);
  formData.append('redirect_uri', getEnvOrThrow('ENDAOMENT_REDIRECT_URI'));

  const tokenResponse = await fetch(staticUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.ENDAOMENT_CLIENT_ID}:${process.env.ENDAOMENT_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: formData,
  });
  const tokenResponseJson = await tokenResponse.json();

  res.cookie(ACCESS_TOKEN_NAME, tokenResponseJson, {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
  });
  res.redirect(getEnvOrThrow('FRONTEND_URL'));
  res.end();
};
