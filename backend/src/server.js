const app = require('./app');
const config = require('./config');
const { connectDB } = require('./config/db');

async function start() {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} [${config.nodeEnv}]`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
