const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { asyncHandler } = require('../middleware/asyncHandler');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authenticate, asyncHandler(dashboardController.getStats));

module.exports = router;
