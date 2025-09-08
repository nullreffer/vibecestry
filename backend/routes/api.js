const express = require('express');
const router = express.Router();

// Sample data for demonstration
let flowData = {
  nodes: [
    {
      id: '1',
      type: 'input',
      data: { label: 'API Node 1' },
      position: { x: 250, y: 25 },
    },
    {
      id: '2',
      data: { label: 'API Node 2' },
      position: { x: 100, y: 125 },
    },
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2' },
  ],
};

// GET /api/flow - Get flow data
router.get('/flow', (req, res) => {
  res.json({
    success: true,
    data: flowData
  });
});

// POST /api/flow - Save flow data
router.post('/flow', (req, res) => {
  const { nodes, edges } = req.body;
  
  if (!nodes || !edges) {
    return res.status(400).json({
      success: false,
      error: 'Nodes and edges are required'
    });
  }

  flowData = { nodes, edges };
  
  res.json({
    success: true,
    message: 'Flow data saved successfully',
    data: flowData
  });
});

// GET /api/nodes - Get all nodes
router.get('/nodes', (req, res) => {
  res.json({
    success: true,
    data: flowData.nodes
  });
});

// POST /api/nodes - Add a new node
router.post('/nodes', (req, res) => {
  const newNode = req.body;
  
  if (!newNode.id || !newNode.data) {
    return res.status(400).json({
      success: false,
      error: 'Node id and data are required'
    });
  }

  flowData.nodes.push(newNode);
  
  res.json({
    success: true,
    message: 'Node added successfully',
    data: newNode
  });
});

// DELETE /api/nodes/:id - Delete a node
router.delete('/nodes/:id', (req, res) => {
  const nodeId = req.params.id;
  const nodeIndex = flowData.nodes.findIndex(node => node.id === nodeId);
  
  if (nodeIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Node not found'
    });
  }

  flowData.nodes.splice(nodeIndex, 1);
  // Also remove any edges connected to this node
  flowData.edges = flowData.edges.filter(
    edge => edge.source !== nodeId && edge.target !== nodeId
  );
  
  res.json({
    success: true,
    message: 'Node deleted successfully'
  });
});

module.exports = router;
