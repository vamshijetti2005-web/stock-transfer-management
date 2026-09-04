const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Warehouse = require('../src/models/Warehouse');
const Transfer = require('../src/models/Transfer');
const transferService = require('../src/services/transferService');
const warehouseService = require('../src/services/warehouseService');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await Promise.all([Warehouse.deleteMany({}), Transfer.deleteMany({})]);
});

async function seedWarehouses() {
  const source = await warehouseService.createWarehouse({
    name: 'Central Hub',
    code: 'WH-A',
    location: 'Hyderabad',
  });
  const dest = await warehouseService.createWarehouse({
    name: 'City Store',
    code: 'WH-B',
    location: 'Bengaluru',
  });

  await warehouseService.upsertStock(source._id, {
    sku: 'SKU-100',
    name: 'Wireless Mouse',
    quantity: 20,
  });
  await warehouseService.upsertStock(dest._id, {
    sku: 'SKU-100',
    name: 'Wireless Mouse',
    quantity: 5,
  });

  return { source, dest };
}

describe('transferService business rules', () => {
  test('rejects transfer to the same warehouse', async () => {
    const { source } = await seedWarehouses();

    await expect(
      transferService.createTransfer({
        fromWarehouseId: source._id,
        toWarehouseId: source._id,
        items: [{ sku: 'SKU-100', name: 'Wireless Mouse', quantity: 2 }],
      })
    ).rejects.toMatchObject({
      message: expect.stringMatching(/different/i),
      statusCode: 400,
    });
  });

  test('rejects oversell when creating a transfer', async () => {
    const { source, dest } = await seedWarehouses();

    await expect(
      transferService.createTransfer({
        fromWarehouseId: source._id,
        toWarehouseId: dest._id,
        items: [{ sku: 'SKU-100', name: 'Wireless Mouse', quantity: 50 }],
      })
    ).rejects.toMatchObject({
      message: expect.stringMatching(/Insufficient stock/i),
      statusCode: 400,
    });
  });

  test('rejects illegal status transitions', async () => {
    const { source, dest } = await seedWarehouses();
    const transfer = await transferService.createTransfer({
      fromWarehouseId: source._id,
      toWarehouseId: dest._id,
      items: [{ sku: 'SKU-100', name: 'Wireless Mouse', quantity: 3 }],
    });

    await expect(
      transferService.updateTransferStatus(transfer._id, 'COMPLETED')
    ).rejects.toMatchObject({
      message: expect.stringMatching(/Invalid status transition/i),
      statusCode: 400,
    });
  });

  test('moves stock only when transfer is completed', async () => {
    const { source, dest } = await seedWarehouses();
    const transfer = await transferService.createTransfer({
      fromWarehouseId: source._id,
      toWarehouseId: dest._id,
      items: [{ sku: 'SKU-100', name: 'Wireless Mouse', quantity: 4 }],
    });

    await transferService.updateTransferStatus(transfer._id, 'IN_TRANSIT');

    let from = await Warehouse.findById(source._id);
    let to = await Warehouse.findById(dest._id);
    expect(from.items[0].quantity).toBe(20);
    expect(to.items[0].quantity).toBe(5);

    await transferService.updateTransferStatus(transfer._id, 'COMPLETED');

    from = await Warehouse.findById(source._id);
    to = await Warehouse.findById(dest._id);
    expect(from.items[0].quantity).toBe(16);
    expect(to.items[0].quantity).toBe(9);
  });

  test('cancel does not change stock', async () => {
    const { source, dest } = await seedWarehouses();
    const transfer = await transferService.createTransfer({
      fromWarehouseId: source._id,
      toWarehouseId: dest._id,
      items: [{ sku: 'SKU-100', name: 'Wireless Mouse', quantity: 4 }],
    });

    await transferService.updateTransferStatus(transfer._id, 'CANCELLED');

    const from = await Warehouse.findById(source._id);
    const to = await Warehouse.findById(dest._id);
    expect(from.items[0].quantity).toBe(20);
    expect(to.items[0].quantity).toBe(5);
  });

  test('adds item to destination if SKU did not exist', async () => {
    const source = await warehouseService.createWarehouse({
      name: 'Depot',
      code: 'WH-C',
    });
    const dest = await warehouseService.createWarehouse({
      name: 'Outlet',
      code: 'WH-D',
    });
    await warehouseService.upsertStock(source._id, {
      sku: 'SKU-200',
      name: 'Keyboard',
      quantity: 10,
    });

    const transfer = await transferService.createTransfer({
      fromWarehouseId: source._id,
      toWarehouseId: dest._id,
      items: [{ sku: 'SKU-200', name: 'Keyboard', quantity: 2 }],
    });

    await transferService.updateTransferStatus(transfer._id, 'IN_TRANSIT');
    await transferService.updateTransferStatus(transfer._id, 'COMPLETED');

    const updatedDest = await Warehouse.findById(dest._id);
    expect(updatedDest.items).toHaveLength(1);
    expect(updatedDest.items[0]).toMatchObject({
      sku: 'SKU-200',
      quantity: 2,
    });
  });
});
