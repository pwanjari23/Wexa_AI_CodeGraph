const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/recent', dashboardController.getRecentApis);

module.exports = router;
