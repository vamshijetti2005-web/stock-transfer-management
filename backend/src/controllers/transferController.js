const transferService = require('../services/transferService');

async function create(req, res) {
  const transfer = await transferService.createTransfer({
    fromWarehouseId: req.body.fromWarehouseId,
    toWarehouseId: req.body.toWarehouseId,
    items: req.body.items,
    notes: req.body.notes,
    actor: req.user,
  });
  res.status(201).json({ success: true, data: transfer });
}

async function list(req, res) {
  const transfers = await transferService.listTransfers({
    status: req.query.status,
  });
  res.json({ success: true, data: transfers });
}

async function getById(req, res) {
  const transfer = await transferService.getTransferById(req.params.id);
  res.json({ success: true, data: transfer });
}

async function updateStatus(req, res) {
  const transfer = await transferService.updateTransferStatus(
    req.params.id,
    req.body.status,
    req.user
  );
  res.json({ success: true, data: transfer });
}

module.exports = {
  create,
  list,
  getById,
  updateStatus,
};
