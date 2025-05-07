const express = require('express');
const router = express.Router();

const serviceController = require('./controllers/serviceController');
const usageController = require('./controllers/usageController');

// Service routes
router.post('/services', serviceController.registerService);
router.get('/services', serviceController.getAllServices);
router.get('/services/:id', serviceController.getServiceById);

// Usage routes
router.get('/services/:serviceId/usage', usageController.getServiceUsage);
router.post('/services/:serviceId/usage', usageController.recordManualUsage);

module.exports = router;