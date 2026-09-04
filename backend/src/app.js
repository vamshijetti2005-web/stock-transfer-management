const express = require('express');
const cors = require('cors');
const config = require('./config');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Stock Transfer API is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes will be mounted here (warehouses, transfers)

app.use(notFound);
app.use(errorHandler);

module.exports = app;
