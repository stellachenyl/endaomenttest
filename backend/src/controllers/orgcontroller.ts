import { Request, Response } from 'express';
import { getEndaomentUrls } from '../utils/endaoment-urls';

// Function to search for organizations based on the search term
export async function searchOrgs(req: Request, res: Response) {
  const searchTerm = req.query.searchTerm as string || '';
  const count = parseInt(req.query.count as string) || 10; // Default to 10 results per page
  const offset = parseInt(req.query.offset as string) || 0; // Default to 0 offset

  if (!searchTerm) {
    return res.status(400).json({ error: 'searchTerm is required' });
  }

  try {
    const response = await fetch(
      `${getEndaomentUrls().api}/v2/orgs/search?searchTerm=${searchTerm}&count=${count}&offset=${offset}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch organizations');
    }

    const data = await response.json();
    res.status(200).json(data); // Send search results to frontend
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while searching for organizations' });
  }
}
