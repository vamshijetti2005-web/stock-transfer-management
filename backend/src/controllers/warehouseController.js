const warehouseService = require('../services/warehouseService');

async function create(req, res) {
  const warehouse = await warehouseService.createWarehouse(req.body);
  res.status(201).json({ success: true, data: warehouse });
}

async function list(req, res) {
  const result = await warehouseService.listWarehouses(req.query);
  res.json({ success: true, data: result.items, meta: result.meta });
}

async function listOptions(req, res) {
  const warehouses = await warehouseService.listWarehouseOptions();
  res.json({ success: true, data: warehouses });
}

async function getById(req, res) {
  const warehouse = await warehouseService.getWarehouseById(req.params.id);
  res.json({ success: true, data: warehouse });
}

async function update(req, res) {
  const warehouse = await warehouseService.updateWarehouse(req.params.id, req.body);
  res.json({ success: true, data: warehouse });
}

async function remove(req, res) {
  const result = await warehouseService.deleteWarehouse(req.params.id);
  res.json({ success: true, data: result, message: 'Warehouse deleted' });
}

async function upsertStock(req, res) {
  const warehouse = await warehouseService.upsertStock(req.params.id, req.body);
  res.json({ success: true, data: warehouse });
}

async function deleteStock(req, res) {
  const warehouse = await warehouseService.deleteStock(req.params.id, req.params.sku);
  res.json({ success: true, data: warehouse, message: 'Stock item deleted' });
}

module.exports = {
  create,
  list,
  listOptions,
  getById,
  update,
  remove,
  upsertStock,
  deleteStock,
};
