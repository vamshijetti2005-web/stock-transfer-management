const dns = require('dns');
const mongoose = require('mongoose');
const config = require('./index');

// Some Windows ISP DNS resolvers refuse MongoDB SRV lookups (querySrv ECONNREFUSED).
dns.setServers(['8.8.8.8', '1.1.1.1']);

async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri);
  console.log('MongoDB connected');
}

module.exports = { connectDB };
