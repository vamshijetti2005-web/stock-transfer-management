const Warehouse = require('../models/Warehouse');
const Transfer = require('../models/Transfer');
const { AppError } = require('../middleware/errorHandler');

const ALLOWED_TRANSITIONS = {
  PENDING: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

function assertValidTransition(currentStatus, nextStatus) {
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    throw new AppError(
      `Invalid status transition: ${currentStatus} → ${nextStatus}`,
      400
    );
  }
}

function findStockItem(warehouse, sku) {
  return warehouse.items.find((item) => item.sku === sku);
}

function assertSufficientStock(warehouse, items) {
  for (const line of items) {
    const stock = findStockItem(warehouse, line.sku);
    if (!stock) {
      throw new AppError(
        `SKU ${line.sku} not found in warehouse ${warehouse.code}`,
        400
      );
    }
    if (stock.quantity < line.quantity) {
      throw new AppError(
        `Insufficient stock for ${line.sku} in ${warehouse.code}: has ${stock.quantity}, requested ${line.quantity}`,
        400
      );
    }
  }
}

function applyStockMovement(fromWarehouse, toWarehouse, items) {
  for (const line of items) {
    const source = findStockItem(fromWarehouse, line.sku);
    if (!source || source.quantity < line.quantity) {
      throw new AppError(
        `Insufficient stock for ${line.sku} in ${fromWarehouse.code} at completion`,
        400
      );
    }
    source.quantity -= line.quantity;

    const dest = findStockItem(toWarehouse, line.sku);
    if (dest) {
      dest.name = line.name || dest.name;
      dest.quantity += line.quantity;
    } else {
      toWarehouse.items.push({
        sku: line.sku,
        name: line.name,
        quantity: line.quantity,
      });
    }
  }
}

function actorName(actor) {
  if (!actor) return 'system';
  return actor.name || actor.email || 'user';
}

async function createTransfer({
  fromWarehouseId,
  toWarehouseId,
  items,
  notes,
  actor,
}) {
  if (!fromWarehouseId || !toWarehouseId) {
    throw new AppError('fromWarehouseId and toWarehouseId are required', 400);
  }
  if (String(fromWarehouseId) === String(toWarehouseId)) {
    throw new AppError('Source and destination warehouses must be different', 400);
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('At least one transfer item is required', 400);
  }

  const normalizedItems = items.map((item) => {
    if (!item.sku || !item.name) {
      throw new AppError('Each item needs sku and name', 400);
    }
    const quantity = Number(item.quantity);
    if (!Number.isFinite(quantity) || quantity < 1) {
      throw new AppError('Each item quantity must be at least 1', 400);
    }
    return {
      sku: String(item.sku).trim().toUpperCase(),
      name: String(item.name).trim(),
      quantity,
    };
  });

  const [fromWarehouse, toWarehouse] = await Promise.all([
    Warehouse.findById(fromWarehouseId),
    Warehouse.findById(toWarehouseId),
  ]);

  if (!fromWarehouse) {
    throw new AppError('Source warehouse not found', 404);
  }
  if (!toWarehouse) {
    throw new AppError('Destination warehouse not found', 404);
  }

  assertSufficientStock(fromWarehouse, normalizedItems);

  const createdBy = actorName(actor);

  return Transfer.create({
    fromWarehouse: fromWarehouse._id,
    toWarehouse: toWarehouse._id,
    items: normalizedItems,
    notes: notes ? String(notes).trim() : '',
    status: 'PENDING',
    createdBy,
    statusHistory: [
      {
        status: 'PENDING',
        at: new Date(),
        by: createdBy,
      },
    ],
  });
}

async function listTransfers({ status } = {}) {
  const filter = {};
  if (status) {
    filter.status = String(status).toUpperCase();
  }
  return Transfer.find(filter)
    .populate('fromWarehouse', 'name code location')
    .populate('toWarehouse', 'name code location')
    .sort({ createdAt: -1 });
}

async function getTransferById(id) {
  const transfer = await Transfer.findById(id)
    .populate('fromWarehouse', 'name code location items')
    .populate('toWarehouse', 'name code location items');

  if (!transfer) {
    throw new AppError('Transfer not found', 404);
  }
  return transfer;
}

async function updateTransferStatus(id, nextStatus, actor) {
  if (!nextStatus) {
    throw new AppError('status is required', 400);
  }

  const status = String(nextStatus).toUpperCase();
  const transfer = await Transfer.findById(id);
  if (!transfer) {
    throw new AppError('Transfer not found', 404);
  }

  assertValidTransition(transfer.status, status);

  if (status === 'COMPLETED') {
    const [fromWarehouse, toWarehouse] = await Promise.all([
      Warehouse.findById(transfer.fromWarehouse),
      Warehouse.findById(transfer.toWarehouse),
    ]);

    if (!fromWarehouse || !toWarehouse) {
      throw new AppError('Warehouse linked to transfer no longer exists', 404);
    }

    applyStockMovement(fromWarehouse, toWarehouse, transfer.items);
    await fromWarehouse.save();
    await toWarehouse.save();
  }

  transfer.status = status;
  transfer.statusHistory.push({
    status,
    at: new Date(),
    by: actorName(actor),
  });
  await transfer.save();

  return Transfer.findById(transfer._id)
    .populate('fromWarehouse', 'name code location items')
    .populate('toWarehouse', 'name code location items');
}

module.exports = {
  ALLOWED_TRANSITIONS,
  assertValidTransition,
  assertSufficientStock,
  applyStockMovement,
  createTransfer,
  listTransfers,
  getTransferById,
  updateTransferStatus,
};
