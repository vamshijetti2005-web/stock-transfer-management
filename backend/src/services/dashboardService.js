const Warehouse = require('../models/Warehouse');
const Transfer = require('../models/Transfer');

async function getStats() {
  const [warehouseCount, pending, inTransit, completed, cancelled, recentTransfers] =
    await Promise.all([
      Warehouse.countDocuments(),
      Transfer.countDocuments({ status: 'PENDING' }),
      Transfer.countDocuments({ status: 'IN_TRANSIT' }),
      Transfer.countDocuments({ status: 'COMPLETED' }),
      Transfer.countDocuments({ status: 'CANCELLED' }),
      Transfer.find()
        .populate('fromWarehouse', 'name code')
        .populate('toWarehouse', 'name code')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

  return {
    warehouses: warehouseCount,
    transfers: {
      pending,
      inTransit,
      completed,
      cancelled,
      total: pending + inTransit + completed + cancelled,
    },
    recentTransfers,
  };
}

module.exports = { getStats };
