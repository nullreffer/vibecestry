const express = require('express');
const Chart = require('../../models/Chart');
const { requireAuth } = require('../auth');
const router = express.Router();

// GET /api/flows - Get all flows list for authenticated user
router.get('/', requireAuth, async (req, res) => {
  try {
    const charts = await Chart.find({ userId: req.user.id })
      .select('title description createdAt updatedAt nodes edges')
      .sort({ updatedAt: -1 });
    
    // Transform to match frontend expectations
    const flows = charts.map(chart => ({
      id: chart._id.toString(),
      name: chart.title,
      description: chart.description,
      nodeCount: chart.nodes?.length || 0,
      edgeCount: chart.edges?.length || 0,
      createdAt: chart.createdAt,
      updatedAt: chart.updatedAt
    }));
    
    res.json({
      success: true,
      data: flows
    });
  } catch (error) {
    console.error('Error fetching charts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch charts'
    });
  }
});

// GET /api/flows/:id - Get specific flow data
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const chart = await Chart.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!chart) {
      return res.status(404).json({
        success: false,
        error: 'Flow not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: chart._id.toString(),
        name: chart.title,
        description: chart.description,
        nodes: chart.nodes || [],
        edges: chart.edges || []
      }
    });
  } catch (error) {
    console.error('Error fetching chart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chart'
    });
  }
});

// POST /api/flows/:id - Save specific flow data
router.post('/:id', requireAuth, async (req, res) => {
  try {
    const { nodes, edges, name, description } = req.body;
    
    if (!nodes || !edges) {
      return res.status(400).json({
        success: false,
        error: 'Nodes and edges are required'
      });
    }

    let chart;
    if (req.params.id === 'new') {
      // Create new chart
      chart = new Chart({
        userId: req.user.id,
        title: name || 'New Family Tree',
        description: description || '',
        nodes,
        edges
      });
      await chart.save();
    } else {
      // Update existing chart
      chart = await Chart.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { 
          title: name,
          description,
          nodes,
          edges
        },
        { new: true, runValidators: true }
      );
      
      if (!chart) {
        return res.status(404).json({
          success: false,
          error: 'Flow not found'
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Flow data saved successfully',
      data: {
        id: chart._id.toString(),
        name: chart.title,
        description: chart.description,
        nodes: chart.nodes,
        edges: chart.edges
      }
    });
  } catch (error) {
    console.error('Error saving chart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save chart'
    });
  }
});

// DELETE /api/flows/:id - Delete a flow
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const chart = await Chart.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!chart) {
      return res.status(404).json({
        success: false,
        error: 'Flow not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Flow deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting chart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete chart'
    });
  }
});

module.exports = router;
