const express = require('express');
const router = express.Router();
const { flows, flowsData } = require('../../data/mockData');

// GET /api/flows - Get all flows list
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: flows
  });
});

// GET /api/flows/:id - Get specific flow data
router.get('/:id', (req, res) => {
  const flowId = req.params.id;
  const flow = flowsData[flowId];
  
  if (!flow) {
    return res.status(404).json({
      success: false,
      error: 'Flow not found'
    });
  }
  
  res.json({
    success: true,
    data: flow
  });
});

// POST /api/flows/:id - Save specific flow data
router.post('/:id', (req, res) => {
  const flowId = req.params.id;
  const { nodes, edges, name, description } = req.body;
  
  if (!nodes || !edges) {
    return res.status(400).json({
      success: false,
      error: 'Nodes and edges are required'
    });
  }

  // Update the flow data
  flowsData[flowId] = {
    id: flowId,
    name: name || flowsData[flowId]?.name || `Flow ${flowId}`,
    description: description || flowsData[flowId]?.description || '',
    nodes,
    edges
  };

  // Update flows list metadata
  const flowIndex = flows.findIndex(f => f.id === flowId);
  if (flowIndex !== -1) {
    flows[flowIndex].nodeCount = nodes.length;
    flows[flowIndex].edgeCount = edges.length;
    flows[flowIndex].updatedAt = new Date().toISOString();
    if (name) flows[flowIndex].name = name;
    if (description) flows[flowIndex].description = description;
  }
  
  res.json({
    success: true,
    message: 'Flow data saved successfully',
    data: flowsData[flowId]
  });
});

// DELETE /api/flows/:id - Delete a flow
router.delete('/:id', (req, res) => {
  const flowId = req.params.id;
  
  if (!flowsData[flowId]) {
    return res.status(404).json({
      success: false,
      error: 'Flow not found'
    });
  }
  
  delete flowsData[flowId];
  const flowIndex = flows.findIndex(f => f.id === flowId);
  if (flowIndex !== -1) {
    flows.splice(flowIndex, 1);
  }
  
  res.json({
    success: true,
    message: 'Flow deleted successfully'
  });
});

module.exports = router;
