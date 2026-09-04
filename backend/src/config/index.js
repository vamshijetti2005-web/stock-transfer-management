require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stock-transfer',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  nodeEnv: process.env.NODE_ENV || 'development',
};
