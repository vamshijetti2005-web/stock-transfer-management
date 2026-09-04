const dashboardService = require('../services/dashboardService');

async function getStats(req, res) {
  const data = await dashboardService.getStats();
  res.json({ success: true, data });
}

module.exports = { getStats };
