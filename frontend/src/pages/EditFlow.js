import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
} from 'react-flow-renderer';
import './EditFlow.css';

const EditFlow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [flowName, setFlowName] = useState('');
  const [flowDescription, setFlowDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFlow();
  }, [id]);

  const loadFlow = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockFlowData = {
        '1': {
          id: '1',
          name: 'Sample Flow 1',
          description: 'A sample flow for demonstration',
          nodes: [
            {
              id: '1',
              type: 'input',
              data: { label: 'Start Node' },
              position: { x: 250, y: 25 },
            },
            {
              id: '2',
              data: { label: 'Process Data' },
              position: { x: 100, y: 125 },
            },
            {
              id: '3',
              data: { label: 'Validate' },
              position: { x: 400, y: 125 },
            },
            {
              id: '4',
              type: 'output',
              data: { label: 'End Node' },
              position: { x: 250, y: 225 },
            },
          ],
          edges: [
            { id: 'e1-2', source: '1', target: '2', animated: true },
            { id: 'e1-3', source: '1', target: '3', animated: true },
            { id: 'e2-4', source: '2', target: '4', animated: true },
            { id: 'e3-4', source: '3', target: '4', animated: true },
          ],
        },
        '2': {
          id: '2',
          name: 'Data Processing Flow',
          description: 'Flow for processing user data',
          nodes: [
            {
              id: '1',
              type: 'input',
              data: { label: 'Input Data' },
              position: { x: 100, y: 50 },
            },
            {
              id: '2',
              data: { label: 'Clean Data' },
              position: { x: 300, y: 50 },
            },
            {
              id: '3',
              data: { label: 'Transform' },
              position: { x: 500, y: 50 },
            },
            {
              id: '4',
              data: { label: 'Validate' },
              position: { x: 300, y: 150 },
            },
            {
              id: '5',
              type: 'output',
              data: { label: 'Output' },
              position: { x: 500, y: 150 },
            },
          ],
          edges: [
            { id: 'e1-2', source: '1', target: '2', animated: true },
            { id: 'e2-3', source: '2', target: '3', animated: true },
            { id: 'e2-4', source: '2', target: '4', animated: true },
            { id: 'e3-5', source: '3', target: '5', animated: true },
            { id: 'e4-5', source: '4', target: '5', animated: true },
          ],
        }
      };

      const flowData = mockFlowData[id];
      if (!flowData) {
        setError('Flow not found');
        return;
      }

      setFlowName(flowData.name);
      setFlowDescription(flowData.description);
      setNodes(flowData.nodes);
      setEdges(flowData.edges);
      setError(null);
    } catch (err) {
      setError('Failed to load flow');
      console.error('Error loading flow:', err);
    } finally {
      setLoading(false);
    }
  };

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    [setEdges]
  );

  const addNode = () => {
    const newNode = {
      id: `${Date.now()}`,
      data: { label: `Node ${nodes.length + 1}` },
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 400 + 100 
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleSave = async () => {
    if (!flowName.trim()) {
      alert('Please enter a flow name');
      return;
    }

    setSaving(true);
    try {
      // Here you would make an API call to update the flow
      const flowData = {
        id,
        name: flowName,
        description: flowDescription,
        nodes,
        edges,
        updatedAt: new Date().toISOString()
      };

      console.log('Updating flow:', flowData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Flow updated successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error updating flow:', error);
      alert('Failed to update flow. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
      navigate('/');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this flow? This action cannot be undone.')) {
      try {
        // Here you would make an API call to delete the flow
        console.log('Deleting flow:', id);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        alert('Flow deleted successfully!');
        navigate('/');
      } catch (error) {
        console.error('Error deleting flow:', error);
        alert('Failed to delete flow. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="edit-flow-container">
        <div className="loading">Loading flow...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-flow-container">
        <div className="error-state">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="back-button">
            Back to Flow List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-flow-container">
      <div className="page-header">
        <h1>Edit Flow</h1>
        <p>Modify your workflow using the interactive editor</p>
      </div>

      <div className="flow-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="flowName">Flow Name *</label>
            <input
              id="flowName"
              type="text"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              placeholder="Enter flow name"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="flowDescription">Description</label>
            <input
              id="flowDescription"
              type="text"
              value={flowDescription}
              onChange={(e) => setFlowDescription(e.target.value)}
              placeholder="Enter flow description"
              className="form-input"
            />
          </div>
        </div>
      </div>

      <div className="flow-editor">
        <div className="editor-toolbar">
          <div className="toolbar-left">
            <button onClick={addNode} className="add-node-button">
              + Add Node
            </button>
            <div className="node-count">
              Nodes: {nodes.length} | Edges: {edges.length}
            </div>
          </div>
          <div className="toolbar-right">
            <button onClick={handleDelete} className="delete-flow-button">
              🗑️ Delete Flow
            </button>
          </div>
        </div>

        <div className="flow-canvas">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            style={{ background: '#1a1a1a' }}
          >
            <Controls style={{ background: '#2d2d2d', fill: '#ffffff' }} />
            <MiniMap 
              style={{ background: '#2d2d2d' }}
              nodeColor="#6ede87"
              maskColor="rgba(255, 255, 255, 0.1)"
            />
            <Background 
              variant="dots" 
              gap={20} 
              size={1} 
              color="#404040"
            />
          </ReactFlow>
        </div>
      </div>

      <div className="action-buttons">
        <button 
          onClick={handleCancel}
          className="cancel-button"
          disabled={saving}
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="save-button"
          disabled={saving || !flowName.trim()}
        >
          {saving ? 'Saving...' : 'Update Flow'}
        </button>
      </div>
    </div>
  );
};

export default EditFlow;
