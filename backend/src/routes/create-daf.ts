import type { Request, Response } from 'express';
import { getAccessToken } from '../utils/access-token';
import { getEndaomentUrls } from '../utils/endaoment-urls';

export const createDaf = async (req: Request, res: Response) => {
  const newFundName = req.body['name'];
  const newFundDescription = req.body['description'];
  const newFundAdvisor = req.body['fundAdvisor'];

  if (!newFundName || !newFundDescription || !newFundAdvisor) {
    console.log('Missing required fields');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const token = getAccessToken(req);
  if (!token) {
    console.log('Missing authorization token');
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const fundCreationResponse = await fetch(
    `${getEndaomentUrls().api}/v1/funds`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Pass the user's token in the Authorization header
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fundInput: {
          name: newFundName,
          description: newFundDescription,
          advisor: newFundAdvisor,
        },
      }),
    }
  );

  const fundData = await fundCreationResponse.json();
  if (!fundCreationResponse.ok) {
    return res.status(fundCreationResponse.status).json(fundData);
  }

  // Return the newly created DAF's data to the frontend
  res.status(200).json(fundData);
};
