const mongoose = require('mongoose');

const TRANSFER_STATUSES = ['PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'];

const transferItemSchema = new mongoose.Schema(
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
      min: [1, 'Quantity must be at least 1'],
    },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: TRANSFER_STATUSES,
      required: true,
    },
    at: {
      type: Date,
      default: Date.now,
    },
    by: {
      type: String,
      trim: true,
      default: 'system',
    },
  },
  { _id: false }
);

const transferSchema = new mongoose.Schema(
  {
    fromWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    toWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    items: {
      type: [transferItemSchema],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: 'Transfer must include at least one item',
      },
    },
    status: {
      type: String,
      enum: TRANSFER_STATUSES,
      default: 'PENDING',
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

transferSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Transfer', transferSchema);
module.exports.TRANSFER_STATUSES = TRANSFER_STATUSES;
