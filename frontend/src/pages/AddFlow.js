import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
} from 'react-flow-renderer';
import './AddFlow.css';

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start Node' },
    position: { x: 250, y: 25 },
  },
  {
    id: '2',
    data: { label: 'Process Node' },
    position: { x: 250, y: 125 },
  },
  {
    id: '3',
    type: 'output',
    data: { label: 'End Node' },
    position: { x: 250, y: 225 },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
];

const AddFlow = () => {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [flowName, setFlowName] = useState('');
  const [flowDescription, setFlowDescription] = useState('');
  const [saving, setSaving] = useState(false);

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
      id: `${nodes.length + 1}`,
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
      // Here you would make an API call to save the flow
      const flowData = {
        name: flowName,
        description: flowDescription,
        nodes,
        edges,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Saving flow:', flowData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Flow saved successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error saving flow:', error);
      alert('Failed to save flow. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
      navigate('/');
    }
  };

  return (
    <div className="add-flow-container">
      <div className="page-header">
        <h1>Create New Flow</h1>
        <p>Design your workflow using the interactive editor</p>
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
          <button onClick={addNode} className="add-node-button">
            + Add Node
          </button>
          <div className="node-count">
            Nodes: {nodes.length} | Edges: {edges.length}
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
          {saving ? 'Saving...' : 'Save Flow'}
        </button>
      </div>
    </div>
  );
};

export default AddFlow;
