import cors from 'cors';
import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import { checkLogin } from './routes/check-login';
import { initLogin } from './routes/init-login';
import { logout } from './routes/logout';
import { verifyLogin } from './routes/verify-login';
import { getDafs } from './routes/get-dafs';
import { getWireInstructions, wireDonation } from './routes/wire-donation';
import { getEnvOrThrow } from './utils/env';
import { createDaf } from './routes/create-daf';
import bodyParser from 'body-parser';
import { grant } from './routes/grant';
import { getDafActivity } from './routes/daf-activity';

// Create a new express application instance
const app = express();

// Enable CORS for all routes
app.use(
  cors({
    origin: getEnvOrThrow('FRONTEND_URL'),
    credentials: true,
  })
);
// Enable parsing request bodies
app.use(bodyParser.json());
// Enable cookies
app.use(cookieParser());

// Set the network port
const port = process.env.PORT || 5454;

// Auth routes
app.get('/', verifyLogin);
app.get('/check-login', checkLogin);
app.get('/init-login', initLogin);
app.post('/logout', logout);

// DAF routes
app.get('/get-dafs', getDafs);
app.post('/create-daf', createDaf);
app.post('/grant', grant);
app.get('/get-daf-activity', getDafActivity);

// Donation routes
app.get('/wire-donation', getWireInstructions);
app.post('/wire-donation', wireDonation);

// Start the Express server
app.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}`);
});
