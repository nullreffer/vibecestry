const express = require('express');
const router = express.Router();

// Import route modules
const flowsRoutes = require('./flows/flowsRoutes');
const defaultFlowRoutes = require('./flows/defaultFlowRoutes');
const nodesRoutes = require('./flows/nodesRoutes');

// Mount route modules
router.use('/flows', flowsRoutes);
router.use('/flow', defaultFlowRoutes);
router.use('/nodes', nodesRoutes);

module.exports = router;
