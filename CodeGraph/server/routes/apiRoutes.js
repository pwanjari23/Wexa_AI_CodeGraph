const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.get('/search', apiController.searchApis);
router.get('/all-nodes', apiController.getAllNodes);
router.get('/shortest-path', apiController.getShortestPath);

router.get('/', apiController.listApis);
router.get('/:name', apiController.getApiMetadata);
router.get('/:name/dependencies', apiController.getApiDependencies);
router.get('/:name/impact', apiController.getApiImpact);

module.exports = router;
