import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'react-flow-renderer';
import PersonNode from '../nodes/PersonNode';
import PersonEditDialog from '../components/PersonEditDialog';
import RelationshipEdge from '../edges/RelationshipEdge';
import { useFamilyTreeOperations } from '../hooks/useFamilyTreeOperations';
import { useLinkingMode } from '../hooks/useLinkingMode';
import './AddFlow.css';

const nodeTypes = {
  person: PersonNode,
};

const edgeTypes = {
  relationship: RelationshipEdge,
};

const AddFlow = () => {
  const navigate = useNavigate();
  const [flowName, setFlowName] = useState('');
  const [flowDescription, setFlowDescription] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingPerson, setEditingPerson] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Use custom hooks for family tree operations and linking
  const familyTreeOps = useFamilyTreeOperations(nodes, edges, setNodes, setEdges);
  const { 
    isLinkingMode, 
    setIsLinkingMode,
    linkingSourceId, 
    setLinkingSourceId,
    linkingSourceData,
    setLinkingSourceData
  } = useLinkingMode();

  // Load initial data from API
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await fetch('/api/flow', {
          credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success && result.data) {
          // Clean the node data to remove function references for React Flow
          const cleanNodes = result.data.nodes.map(node => ({
            ...node,
            data: {
              ...node.data,
              // Remove function references, they'll be added back by the node mapping
              onEdit: undefined,
              onDelete: undefined,
              onAddRelative: undefined,
              onLink: undefined
            }
          }));
          
          setNodes(cleanNodes);
          setEdges(result.data.edges || []);
        } else {
          // Fallback to default starter node if API fails
          setNodes([
            {
              id: '1',
              type: 'person',
              position: { x: 400, y: 300 },
              data: { 
                name: 'Start Person',
                biologicalSex: 'male',
                birthDate: '',
                deathDate: '',
                location: '',
                occupation: '',
                notes: ''
              },
            }
          ]);
          setEdges([]);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
        // Fallback to default starter node
        setNodes([
          {
            id: '1',
            type: 'person',
            position: { x: 400, y: 300 },
            data: { 
              name: 'Start Person',
              biologicalSex: 'male',
              birthDate: '',
              deathDate: '',
              location: '',
              occupation: '',
              notes: ''
            },
          }
        ]);
        setEdges([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [setNodes, setEdges]);

  // Generation-based positioning constants
  const GENERATION_HEIGHT = 200;
  const HORIZONTAL_SPACING = 300;
  const CENTER_X = 400;

  const onConnect = useCallback((params) => {
    console.log('Connection params:', params);
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  // Simplified handlers using services
  const handleAddPerson = familyTreeOps.handleAddPerson;
  const handleAddRelative = familyTreeOps.handleAddRelative;
  const handleCreateLink = familyTreeOps.handleCreateLink;
  const handleDeletePerson = familyTreeOps.handleDeletePerson;

  const addNode = () => {
    const newNode = {
      id: `${Date.now()}`,
      type: 'person',
      position: { 
        x: Math.random() * 400 + 200, 
        y: Math.random() * 400 + 200 
      },
      data: { 
        name: 'New Person',
        biologicalSex: 'male',
        birthDate: '',
        deathDate: '',
        location: '',
        occupation: '',
        notes: ''
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // Linking functions
  const handleStartLinking = useCallback((sourceNodeId) => {
    const sourceNode = nodes.find(node => node.id === sourceNodeId);
    if (sourceNode) {
      setIsLinkingMode(true);
      setLinkingSourceId(sourceNodeId);
      setLinkingSourceData(sourceNode.data);
    }
  }, [nodes]);

  const handleCancelLinking = useCallback(() => {
    setIsLinkingMode(false);
    setLinkingSourceId(null);
    setLinkingSourceData(null);
  }, []);

  const getNodeById = useCallback((nodeId) => {
    return nodes.find(n => n.id === nodeId);
  }, [nodes]);

  // Handle editing a person
  const handleEditPerson = useCallback((personId, personData) => {
    setEditingPerson({ id: personId, ...personData });
    setIsEditDialogOpen(true);
  }, []);

  // Handle saving edited person data
  const handleSaveEditedPerson = useCallback((editedData) => {
    if (editingPerson) {
      setNodes((nds) => 
        nds.map(node => 
          node.id === editingPerson.id 
            ? { ...node, data: { ...node.data, ...editedData } }
            : node
        )
      );
    }
    setIsEditDialogOpen(false);
    setEditingPerson(null);
  }, [editingPerson, setNodes]);

  // Handle canceling edit
  const handleCancelEdit = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingPerson(null);
  }, []);

  // Handle linking persons (for future implementation)
  const handleLinkPerson = useCallback((personId, relationship) => {
    // TODO: Implement linking functionality
    alert(`Link ${relationship} functionality coming soon!`);
  }, []);

  const handleSave = async () => {
    if (!flowName.trim()) {
      alert('Please enter a chart name');
      return;
    }

    setSaving(true);
    try {
      const flowData = {
        name: flowName,
        description: flowDescription,
        nodes,
        edges,
        createdAt: new Date().toISOString(),
      };

      const response = await fetch('http://localhost:3001/api/flows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(flowData),
      });

      if (response.ok) {
        navigate('/');
      } else {
        alert('Failed to save chart');
      }
    } catch (error) {
      console.error('Error saving chart:', error);
      alert('Failed to save chart');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="add-flow-container">
        <div className="loading-spinner">
          <p>Loading family tree data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-flow-container">
      <div className="flow-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="flowName">Chart Name *</label>
            <input
              id="flowName"
              type="text"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              placeholder="Enter chart name"
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
              placeholder="Enter chart description"
              className="form-input"
            />
          </div>
        </div>
      </div>

      <div className="flow-editor">
        <div className="editor-toolbar">
          <div className="toolbar-left">
            <button onClick={addNode} className="add-node-button">
              + Add Person
            </button>
            <div className="node-count">
              People: {nodes.length} | Relationships: {edges.length}
            </div>
          </div>
          <div className="toolbar-center">
            <div className="instructions">
              <span>💡 Hover over a person to add family members</span>
            </div>
          </div>
        </div>

        <div className="flow-canvas">
          <ReactFlow
            nodes={nodes.map(node => ({
              ...node,
              data: {
                ...node.data,
                onAddPerson: handleAddPerson,
                onAddRelative: handleAddRelative,
                onEdit: handleEditPerson,
                onDelete: handleDeletePerson,
                onLink: handleLinkPerson,
                onStartLinking: handleStartLinking,
                onCancelLinking: handleCancelLinking,
                onCreateLink: handleCreateLink,
                isInLinkingMode: isLinkingMode,
                linkingSourceId: linkingSourceId,
                linkingSourceName: linkingSourceData?.name,
                linkingSourceSex: linkingSourceData?.biologicalSex,
                getNodeById: getNodeById
              }
            }))}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            style={{ background: '#1a1a1a' }}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            onPaneClick={() => {
              // Close any open action panels by triggering a re-render
              setNodes(nodes => [...nodes]);
            }}
          >
            <Controls style={{ background: '#2d2d2d', fill: '#ffffff' }} />
            <MiniMap 
              style={{ background: '#2d2d2d' }}
              nodeColor={(node) => {
                if (node.type === 'person') {
                  return node.data?.biologicalSex === 'male' ? '#4a90e2' : '#e24a90';
                }
                return '#6ede87';
              }}
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
          {saving ? 'Saving...' : 'Create Chart'}
        </button>
      </div>

      <PersonEditDialog
        person={editingPerson}
        isOpen={isEditDialogOpen}
        onSave={handleSaveEditedPerson}
        onCancel={handleCancelEdit}
      />
    </div>
  );
};

export default AddFlow;
