const express = require('express');
const warehouseController = require('../controllers/warehouseController');
const { asyncHandler } = require('../middleware/asyncHandler');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', asyncHandler(warehouseController.create));
router.get('/', asyncHandler(warehouseController.list));
router.get('/options/all', asyncHandler(warehouseController.listOptions));
router.get('/:id', asyncHandler(warehouseController.getById));
router.put('/:id', asyncHandler(warehouseController.update));
router.delete('/:id', asyncHandler(warehouseController.remove));
router.post('/:id/stock', asyncHandler(warehouseController.upsertStock));
router.delete('/:id/stock/:sku', asyncHandler(warehouseController.deleteStock));

module.exports = router;
