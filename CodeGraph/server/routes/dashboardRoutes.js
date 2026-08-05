const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/recent', dashboardController.getRecentApis);
router.get('/stats', dashboardController.getStats);

module.exports = router;
