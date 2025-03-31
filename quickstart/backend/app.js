require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const routes = require('./routes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5454;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});