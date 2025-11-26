const express = require('express');
const router = express.Router();

// Import route modules
const flowsRoutes = require('./flows/flowsRoutes');
const defaultFlowRoutes = require('./flows/defaultFlowRoutes');
const nodesRoutes = require('./flows/nodesRoutes');
const settingsRoutes = require('./settings');

// Mount routes
router.use('/flows', flowsRoutes);
router.use('/default-flows', defaultFlowRoutes);
router.use('/nodes', nodesRoutes);
router.use('/settings', settingsRoutes);

module.exports = router;
