const Warehouse = require('../models/Warehouse');
const { AppError } = require('../middleware/errorHandler');

async function createWarehouse({ name, code, location }) {
  if (!name || !code) {
    throw new AppError('Name and code are required', 400);
  }

  const existing = await Warehouse.findOne({ code: code.trim().toUpperCase() });
  if (existing) {
    throw new AppError(`Warehouse code already exists: ${code}`, 409);
  }

  return Warehouse.create({
    name: name.trim(),
    code: code.trim().toUpperCase(),
    location: location ? location.trim() : '',
    items: [],
  });
}

async function listWarehouses() {
  return Warehouse.find().sort({ name: 1 });
}

async function getWarehouseById(id) {
  const warehouse = await Warehouse.findById(id);
  if (!warehouse) {
    throw new AppError('Warehouse not found', 404);
  }
  return warehouse;
}

async function upsertStock(warehouseId, { sku, name, quantity }) {
  if (!sku || !name) {
    throw new AppError('SKU and name are required', 400);
  }
  if (quantity === undefined || quantity === null || Number(quantity) < 0) {
    throw new AppError('Quantity must be a non-negative number', 400);
  }

  const warehouse = await getWarehouseById(warehouseId);
  const normalizedSku = sku.trim().toUpperCase();
  const existing = warehouse.items.find((item) => item.sku === normalizedSku);

  if (existing) {
    existing.name = name.trim();
    existing.quantity = Number(quantity);
  } else {
    warehouse.items.push({
      sku: normalizedSku,
      name: name.trim(),
      quantity: Number(quantity),
    });
  }

  await warehouse.save();
  return warehouse;
}

module.exports = {
  createWarehouse,
  listWarehouses,
  getWarehouseById,
  upsertStock,
};
