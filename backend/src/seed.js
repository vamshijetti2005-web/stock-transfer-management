require('dotenv').config();

const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Warehouse = require('./models/Warehouse');
const Transfer = require('./models/Transfer');

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Warehouse.deleteMany({}),
    Transfer.deleteMany({}),
  ]);

  const demoUser = await User.create({
    name: 'Demo User',
    email: 'demo@stock.app',
    password: 'Demo@123',
  });

  const [hub, store, outlet] = await Warehouse.create([
    {
      name: 'Central Hub',
      code: 'WH-A',
      location: 'Hyderabad',
      items: [
        { sku: 'SKU-100', name: 'Wireless Mouse', quantity: 40 },
        { sku: 'SKU-200', name: 'Mechanical Keyboard', quantity: 25 },
        { sku: 'SKU-300', name: 'USB-C Hub', quantity: 15 },
      ],
    },
    {
      name: 'City Store',
      code: 'WH-B',
      location: 'Bengaluru',
      items: [
        { sku: 'SKU-100', name: 'Wireless Mouse', quantity: 8 },
        { sku: 'SKU-200', name: 'Mechanical Keyboard', quantity: 3 },
      ],
    },
    {
      name: 'Outlet',
      code: 'WH-C',
      location: 'Chennai',
      items: [{ sku: 'SKU-300', name: 'USB-C Hub', quantity: 2 }],
    },
  ]);

  const pending = await Transfer.create({
    fromWarehouse: hub._id,
    toWarehouse: store._id,
    items: [{ sku: 'SKU-100', name: 'Wireless Mouse', quantity: 5 }],
    status: 'PENDING',
    notes: 'Restock city store mice',
    createdBy: demoUser.name,
    statusHistory: [
      { status: 'PENDING', at: new Date(), by: demoUser.name },
    ],
  });

  const inTransit = await Transfer.create({
    fromWarehouse: hub._id,
    toWarehouse: outlet._id,
    items: [{ sku: 'SKU-200', name: 'Mechanical Keyboard', quantity: 4 }],
    status: 'IN_TRANSIT',
    notes: 'Outlet keyboard refill',
    createdBy: demoUser.name,
    statusHistory: [
      { status: 'PENDING', at: new Date(Date.now() - 3600000), by: demoUser.name },
      { status: 'IN_TRANSIT', at: new Date(), by: demoUser.name },
    ],
  });

  const completed = await Transfer.create({
    fromWarehouse: hub._id,
    toWarehouse: store._id,
    items: [{ sku: 'SKU-300', name: 'USB-C Hub', quantity: 2 }],
    status: 'COMPLETED',
    notes: 'Completed sample transfer',
    createdBy: demoUser.name,
    statusHistory: [
      { status: 'PENDING', at: new Date(Date.now() - 7200000), by: demoUser.name },
      { status: 'IN_TRANSIT', at: new Date(Date.now() - 3600000), by: demoUser.name },
      { status: 'COMPLETED', at: new Date(), by: demoUser.name },
    ],
  });

  // Mirror completed stock movement for realism
  const source = await Warehouse.findById(hub._id);
  const dest = await Warehouse.findById(store._id);
  const sourceItem = source.items.find((i) => i.sku === 'SKU-300');
  sourceItem.quantity -= 2;
  const destItem = dest.items.find((i) => i.sku === 'SKU-300');
  if (destItem) {
    destItem.quantity += 2;
  } else {
    dest.items.push({ sku: 'SKU-300', name: 'USB-C Hub', quantity: 2 });
  }
  await source.save();
  await dest.save();

  console.log('Seed complete');
  console.log('Demo login: demo@stock.app / Demo@123');
  console.log(`Warehouses: ${hub.code}, ${store.code}, ${outlet.code}`);
  console.log(
    `Transfers: pending=${pending._id}, inTransit=${inTransit._id}, completed=${completed._id}`
  );

  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
