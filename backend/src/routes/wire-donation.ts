import crypto from 'crypto';
import { getAccessToken } from '../utils/access-token';
import type { Request, Response } from 'express';
import { getEndaomentUrls } from '../utils/endaoment-urls';

// Function to get wire instructions
export async function getWireInstructions(req: Request, res: Response) {
  // Get wire type from the query parameters (default to domestic)
  const wireType = req.query.type || 'domestic'; // Default to domestic if no type is provided

  // Construct the correct URL based on wire type
  const wireInstructionsUrl = 
    wireType === 'international'
      ? `${getEndaomentUrls().api}/v1/donation-pledges/wire/details/international`
      : `${getEndaomentUrls().api}/v1/donation-pledges/wire/details/domestic`;

  try {
    // Fetch wire instructions from Endaoment API
    const wireInstructionsResponse = await fetch(wireInstructionsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!wireInstructionsResponse.ok) {
      return res.status(wireInstructionsResponse.status).json({ error: 'Failed to fetch wire instructions' });
    }

    const wireInstructions = await wireInstructionsResponse.json();
    res.status(200).json(wireInstructions); // Return wire instructions to frontend
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching wire instructions' });
  }
}

export async function wireDonation(req: Request, res: Response) {
  const amount = req.body['amount'];
  const receivingFundId = req.body['fundId'];

  if (!amount || !receivingFundId) {
    return res.status(400).json({ error: 'Missing amount or fundId' });
  }

  const token = getAccessToken(req);
  const idempotencyKey = crypto.randomUUID();
  const pledgedAmountMicroDollars = (BigInt(amount) * 1000000n).toString();

  try {
    // Send the donation request to Endaoment API
    const donationRequest = await fetch(`${getEndaomentUrls().api}/v1/donation-pledges/wire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        pledgedAmountMicroDollars,
        receivingFundId,
        idempotencyKey,
      }),
    });

    const donation = await donationRequest.json();
    res.status(200).json(donation); // Return donation response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the donation' });
  }
}
