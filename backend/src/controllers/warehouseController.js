const warehouseService = require('../services/warehouseService');

async function create(req, res) {
  const warehouse = await warehouseService.createWarehouse(req.body);
  res.status(201).json({ success: true, data: warehouse });
}

async function list(req, res) {
  const warehouses = await warehouseService.listWarehouses();
  res.json({ success: true, data: warehouses });
}

async function getById(req, res) {
  const warehouse = await warehouseService.getWarehouseById(req.params.id);
  res.json({ success: true, data: warehouse });
}

async function upsertStock(req, res) {
  const warehouse = await warehouseService.upsertStock(req.params.id, req.body);
  res.json({ success: true, data: warehouse });
}

module.exports = {
  create,
  list,
  getById,
  upsertStock,
};
