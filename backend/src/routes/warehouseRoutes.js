const express = require('express');
const warehouseController = require('../controllers/warehouseController');
const { asyncHandler } = require('../middleware/asyncHandler');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', asyncHandler(warehouseController.create));
router.get('/', asyncHandler(warehouseController.list));
router.get('/:id', asyncHandler(warehouseController.getById));
router.post('/:id/stock', asyncHandler(warehouseController.upsertStock));

module.exports = router;
