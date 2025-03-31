import express, { Request, Response } from 'express';
import { searchOrgs } from '../utils/org-controller'; // Import your controller function for searching

const router = express.Router();

// Define a route for searching organizations
router.get('/search', searchOrgs);

export default router;