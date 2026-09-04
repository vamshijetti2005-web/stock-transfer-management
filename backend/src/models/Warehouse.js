const mongoose = require('mongoose');

const stockItemSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Warehouse name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Warehouse code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    items: {
      type: [stockItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Warehouse', warehouseSchema);
