const express = require('express');
const router = express.Router();

// Sample family tree data for demonstration
let flowData = {
  nodes: [
    {
      id: '1',
      type: 'person',
      position: { x: 400, y: 300 },
      data: {
        name: 'John Doe',
        biologicalSex: 'male',
        birthDate: '1950-01-15',
        deathDate: '',
        location: 'New York, NY',
        occupation: 'Engineer',
        notes: 'Family patriarch',
        onEdit: () => {},
        onDelete: () => {},
        onAddRelative: () => {},
        onLink: () => {}
      }
    },
    {
      id: '2',
      type: 'person',
      position: { x: 600, y: 300 },
      data: {
        name: 'Jane Smith',
        biologicalSex: 'female',
        birthDate: '1952-03-22',
        deathDate: '',
        location: 'New York, NY',
        occupation: 'Teacher',
        notes: 'Loving mother',
        onEdit: () => {},
        onDelete: () => {},
        onAddRelative: () => {},
        onLink: () => {}
      }
    },
    {
      id: '3',
      type: 'person',
      position: { x: 500, y: 150 },
      data: {
        name: 'Robert Doe',
        biologicalSex: 'male',
        birthDate: '1975-07-10',
        deathDate: '',
        location: 'Boston, MA',
        occupation: 'Doctor',
        notes: 'Eldest son',
        onEdit: () => {},
        onDelete: () => {},
        onAddRelative: () => {},
        onLink: () => {}
      }
    }
  ],
  edges: [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'relationship',
      data: { label: 'Spouse', relationshipType: 'spouse' },
      style: { stroke: '#ff69b4', strokeWidth: 2, strokeDasharray: '3,3' }
    },
    {
      id: 'e1-3',
      source: '1',
      target: '3',
      type: 'relationship',
      data: { label: 'Father', relationshipType: 'biological-parent' },
      style: { stroke: '#6ede87', strokeWidth: 2, strokeDasharray: 'none' }
    },
    {
      id: 'e2-3',
      source: '2',
      target: '3',
      type: 'relationship',
      data: { label: 'Mother', relationshipType: 'biological-parent' },
      style: { stroke: '#6ede87', strokeWidth: 2, strokeDasharray: 'none' }
    }
  ]
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
