require('dotenv').config();

function parseCorsOrigin(value) {
  const raw = value || 'http://localhost:4200';
  const parts = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return parts.length === 1 ? parts[0] : parts;
}

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stock-transfer',
  corsOrigin: parseCorsOrigin(process.env.CORS_ORIGIN),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-stock-transfer-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
