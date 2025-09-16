const express = require('express');
const router = express.Router();
const { defaultFlowData } = require('../../data/mockData');

// GET /api/nodes - Get all nodes from default flow
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: defaultFlowData.nodes
  });
});

// POST /api/nodes - Add a new node to default flow
router.post('/', (req, res) => {
  const newNode = req.body;
  
  if (!newNode.id || !newNode.data) {
    return res.status(400).json({
      success: false,
      error: 'Node id and data are required'
    });
  }

  defaultFlowData.nodes.push(newNode);
  
  res.json({
    success: true,
    message: 'Node added successfully',
    data: newNode
  });
});

// DELETE /api/nodes/:id - Delete a node from default flow
router.delete('/:id', (req, res) => {
  const nodeId = req.params.id;
  const nodeIndex = defaultFlowData.nodes.findIndex(node => node.id === nodeId);
  
  if (nodeIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Node not found'
    });
  }

  defaultFlowData.nodes.splice(nodeIndex, 1);
  // Also remove any edges connected to this node
  defaultFlowData.edges = defaultFlowData.edges.filter(
    edge => edge.source !== nodeId && edge.target !== nodeId
  );
  
  res.json({
    success: true,
    message: 'Node deleted successfully'
  });
});

module.exports = router;
