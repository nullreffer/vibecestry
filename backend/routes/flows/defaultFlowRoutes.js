const express = require('express');
const router = express.Router();
const { defaultFlowData } = require('../../data/mockData');

// GET /api/flow - Get default flow data (for AddFlow)
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: defaultFlowData
  });
});

// POST /api/flow - Save default flow data
router.post('/', (req, res) => {
  const { nodes, edges } = req.body;
  
  if (!nodes || !edges) {
    return res.status(400).json({
      success: false,
      error: 'Nodes and edges are required'
    });
  }

  // In a real app, this would save to database
  // For now, we just update the mock data
  defaultFlowData.nodes = nodes;
  defaultFlowData.edges = edges;
  
  res.json({
    success: true,
    message: 'Flow data saved successfully',
    data: defaultFlowData
  });
});

module.exports = router;
