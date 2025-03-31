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

// Generate code verifier and challenge
function generateCodeVerifier() {
    const randomBytes = crypto.randomBytes(32);
    return toUrlSafe(randomBytes.toString('base64'));
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5454;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});