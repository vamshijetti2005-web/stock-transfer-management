const Warehouse = require('../models/Warehouse');
const Transfer = require('../models/Transfer');
const { AppError } = require('../middleware/errorHandler');
const { parsePagination, buildMeta } = require('../utils/pagination');

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

async function listWarehouses(query = {}) {
  const { page, limit, skip } = parsePagination(query, { page: 1, limit: 5 });
  const filter = {};

  if (query.location && String(query.location).trim()) {
    filter.location = {
      $regex: String(query.location).trim(),
      $options: 'i',
    };
  }

  const [items, total] = await Promise.all([
    Warehouse.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
    Warehouse.countDocuments(filter),
  ]);

  return {
    items,
    meta: buildMeta({ page, limit, total }),
  };
}

async function listWarehouseOptions() {
  return Warehouse.find().select('name code location items').sort({ name: 1 });
}

async function getWarehouseById(id) {
  const warehouse = await Warehouse.findById(id);
  if (!warehouse) {
    throw new AppError('Warehouse not found', 404);
  }
  return warehouse;
}

async function updateWarehouse(id, { name, code, location }) {
  const warehouse = await getWarehouseById(id);

  if (name !== undefined) {
    if (!String(name).trim()) {
      throw new AppError('Name is required', 400);
    }
    warehouse.name = String(name).trim();
  }

  if (code !== undefined) {
    const normalizedCode = String(code).trim().toUpperCase();
    if (!normalizedCode) {
      throw new AppError('Code is required', 400);
    }
    const duplicate = await Warehouse.findOne({
      code: normalizedCode,
      _id: { $ne: warehouse._id },
    });
    if (duplicate) {
      throw new AppError(`Warehouse code already exists: ${normalizedCode}`, 409);
    }
    warehouse.code = normalizedCode;
  }

  if (location !== undefined) {
    warehouse.location = String(location).trim();
  }

  await warehouse.save();
  return warehouse;
}

async function deleteWarehouse(id) {
  const warehouse = await getWarehouseById(id);

  const linkedTransfers = await Transfer.countDocuments({
    $or: [{ fromWarehouse: id }, { toWarehouse: id }],
  });

  if (linkedTransfers > 0) {
    throw new AppError(
      'Cannot delete warehouse that is used in transfers. Cancel/remove related transfers first, or keep the warehouse for history.',
      400
    );
  }

  await warehouse.deleteOne();
  return { id };
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

async function deleteStock(warehouseId, sku) {
  if (!sku) {
    throw new AppError('SKU is required', 400);
  }

  const warehouse = await getWarehouseById(warehouseId);
  const normalizedSku = String(sku).trim().toUpperCase();
  const before = warehouse.items.length;
  warehouse.items = warehouse.items.filter((item) => item.sku !== normalizedSku);

  if (warehouse.items.length === before) {
    throw new AppError(`SKU ${normalizedSku} not found in warehouse`, 404);
  }

  await warehouse.save();
  return warehouse;
}

module.exports = {
  createWarehouse,
  listWarehouses,
  listWarehouseOptions,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
  upsertStock,
  deleteStock,
};
