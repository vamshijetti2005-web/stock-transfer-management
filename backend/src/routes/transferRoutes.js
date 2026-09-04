const express = require('express');
const transferController = require('../controllers/transferController');
const { asyncHandler } = require('../middleware/asyncHandler');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', asyncHandler(transferController.create));
router.get('/', asyncHandler(transferController.list));
router.get('/:id', asyncHandler(transferController.getById));
router.patch('/:id/status', asyncHandler(transferController.updateStatus));

module.exports = router;
