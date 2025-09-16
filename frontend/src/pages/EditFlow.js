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
import PersonNode from '../nodes/PersonNode';
import PersonEditDialog from '../components/PersonEditDialog';
import AddRelativeDialog from '../components/AddRelativeDialog';
import LinkRelationshipDialog from '../components/LinkRelationshipDialog';
import RelationshipEdge from '../edges/RelationshipEdge';
import { getEdgeStyleForRelationship } from '../constants/relationships';
import './EditFlow.css';

// Custom node types for ancestry
const nodeTypes = {
  person: PersonNode,
};

const edgeTypes = {
  relationship: RelationshipEdge,
};

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
  const [nodeIdCounter, setNodeIdCounter] = useState(5);
  const [editingPerson, setEditingPerson] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLinkingMode, setIsLinkingMode] = useState(false);
  const [linkingSourceId, setLinkingSourceId] = useState(null);
  const [linkingSourceData, setLinkingSourceData] = useState(null);
  const [linkingTargetId, setLinkingTargetId] = useState(null);
  const [linkingTargetData, setLinkingTargetData] = useState(null);
  const [isLinkRelationshipDialogOpen, setIsLinkRelationshipDialogOpen] = useState(false);
  const [isAddRelativeDialogOpen, setIsAddRelativeDialogOpen] = useState(false);
  const [addRelativeSource, setAddRelativeSource] = useState(null);

  useEffect(() => {
    loadFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadFlow = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/flows/${id}`);
      const result = await response.json();
      
      if (result.success) {
        const flowData = result.data;
        setFlowName(flowData.name);
        setFlowDescription(flowData.description);
        setNodes(flowData.nodes);
        setEdges(flowData.edges);
        setError(null);
      } else {
        setError('Flow not found');
      }
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

  // Function to generate new person data
  const generatePersonData = (relationship) => {
    const names = {
      parent: ['Robert Smith', 'Mary Johnson', 'David Wilson', 'Sarah Brown'],
      child: ['Emma Doe', 'Michael Doe', 'Sofia Doe', 'James Doe'],
      spouse: ['Jane Smith', 'Lisa Johnson', 'Anna Wilson', 'Kate Brown']
    };
    
    const relationshipNames = names[relationship] || names.parent;
    const randomName = relationshipNames[Math.floor(Math.random() * relationshipNames.length)];
    
    return {
      name: randomName,
      biologicalSex: Math.random() > 0.5 ? 'male' : 'female',
      birthDate: `${Math.floor(Math.random() * 50) + 1950}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      location: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX'][Math.floor(Math.random() * 4)],
      occupation: '',
      notes: ''
    };
  };

  // Function to calculate position for new nodes
  const calculateNewPosition = (sourceNodeId, direction) => {
    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    if (!sourceNode) return { x: 200, y: 200 };

    const { x, y } = sourceNode.position;
    const offset = 250;

    switch (direction) {
      case 'parent':
        return { x, y: y - offset };
      case 'child':
        return { x, y: y + offset };
      case 'spouse-left':
        return { x: x - offset, y };
      case 'spouse-right':
        return { x: x + offset, y };
      default:
        return { x, y };
    }
  };

  // Function to determine relationship labels
  const getRelationshipLabel = useCallback((direction, sourceGender, targetGender) => {
    switch (direction) {
      case 'parent':
        // Source is parent, target is child
        return sourceGender === 'male' ? 'Father' : sourceGender === 'female' ? 'Mother' : 'Parent';
      case 'child':
        // Source is parent, target is child
        return targetGender === 'male' ? 'Son' : targetGender === 'female' ? 'Daughter' : 'Child';
      case 'spouse-left':
      case 'spouse-right':
        // Marriage relationship
        if (sourceGender === 'male' && targetGender === 'female') return 'Husband';
        if (sourceGender === 'female' && targetGender === 'male') return 'Wife';
        return 'Spouse';
      default:
        return 'Related';
    }
  }, []);

  // Function to handle adding new person
  const handleAddPerson = useCallback((sourceNodeId, direction) => {
    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    if (!sourceNode) return;

    const newNodeId = String(nodeIdCounter);
    const newPosition = calculateNewPosition(sourceNodeId, direction);
    const personData = generatePersonData(direction === 'spouse-left' || direction === 'spouse-right' ? 'spouse' : direction);
    
    const newNode = {
      id: newNodeId,
      type: 'person',
      data: personData,
      position: newPosition,
    };

    // Add the new node
    setNodes((nds) => nds.concat(newNode));
    
    // Get source node gender for relationship labeling
    const sourceGender = sourceNode.data.biologicalSex || sourceNode.data.gender || 'unknown';
    const newPersonGender = newNode.data.biologicalSex;
    
    // Create connection between nodes
    let newEdge;
    switch (direction) {
      case 'parent':
        newEdge = {
          id: `e${newNodeId}-${sourceNodeId}`,
          source: newNodeId,
          target: sourceNodeId,
          type: 'relationship',
          data: { 
            label: getRelationshipLabel(direction, newPersonGender, sourceGender),
            relationshipType: 'parent'
          },
          animated: true,
          style: { stroke: '#6ede87', strokeWidth: 2 }
        };
        break;
      case 'child':
        newEdge = {
          id: `e${sourceNodeId}-${newNodeId}`,
          source: sourceNodeId,
          target: newNodeId,
          type: 'relationship',
          data: { 
            label: getRelationshipLabel(direction, sourceGender, newPersonGender),
            relationshipType: 'child'
          },
          animated: true,
          style: { stroke: '#6ede87', strokeWidth: 2 }
        };
        break;
      case 'spouse-left':
      case 'spouse-right':
        newEdge = {
          id: `e${sourceNodeId}-${newNodeId}`,
          source: sourceNodeId,
          target: newNodeId,
          type: 'relationship',
          data: { 
            label: getRelationshipLabel(direction, sourceGender, newPersonGender),
            relationshipType: 'spouse'
          },
          animated: false,
          style: { stroke: '#e24a90', strokeWidth: 3, strokeDasharray: '5,5' }
        };
        break;
      default:
        break;
    }

    if (newEdge) {
      setEdges((eds) => eds.concat(newEdge));
    }

    setNodeIdCounter(prev => prev + 1);
  }, [nodes, nodeIdCounter]);

  const handleAddRelative = useCallback((sourceId, sourceData) => {
    setAddRelativeSource({ id: sourceId, ...sourceData });
    setIsAddRelativeDialogOpen(true);
  }, []);

  const addNode = () => {
    const newNode = {
      id: String(nodeIdCounter),
      type: 'person',
      data: {
        name: 'New Person',
        biologicalSex: 'male',
        birthDate: '',
        deathDate: '',
        location: '',
        occupation: '',
        notes: ''
      },
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 400 + 100 
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setNodeIdCounter(prev => prev + 1);
  };

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
  }, [editingPerson]);

  // Handle link relative button click
  const handleLinkRelative = useCallback((sourceId, sourceData) => {
    setIsLinkingMode(true);
    setLinkingSourceId(sourceId);
    setLinkingSourceData(sourceData);
  }, []);

  // Handle target node click during linking
  const handleNodeClickForLinking = useCallback((event, clickedNode) => {
    if (isLinkingMode && linkingSourceId && clickedNode.id !== linkingSourceId) {
      setLinkingTargetId(clickedNode.id);
      setLinkingTargetData(clickedNode.data);
      setIsLinkRelationshipDialogOpen(true);
    }
  }, [isLinkingMode, linkingSourceId]);

  // Handle saving link relationship
  const handleSaveLinkRelationship = useCallback((relationshipType) => {
    if (linkingSourceId && linkingTargetId) {
      // Get edge styling based on relationship type using constants
      const edgeStyle = getEdgeStyleForRelationship(relationshipType);
      const edgeLabel = relationshipType;

      // Create relationship edge between the two nodes
      const newEdge = {
        id: `edge-${linkingSourceId}-${linkingTargetId}-${Date.now()}`,
        source: linkingSourceId,
        target: linkingTargetId,
        label: edgeLabel,
        type: 'smoothstep',
        style: edgeStyle
      };

      setEdges((eds) => [...eds, newEdge]);
    }

    // Reset linking state
    setIsLinkingMode(false);
    setLinkingSourceId(null);
    setLinkingSourceData(null);
    setLinkingTargetId(null);
    setLinkingTargetData(null);
    setIsLinkRelationshipDialogOpen(false);
  }, [linkingSourceId, linkingTargetId]);

  // Handle cancel linking
  const handleCancelLinking = useCallback(() => {
    setIsLinkingMode(false);
    setLinkingSourceId(null);
    setLinkingSourceData(null);
    setLinkingTargetId(null);
    setLinkingTargetData(null);
    setIsLinkRelationshipDialogOpen(false);
  }, []);

  // Handle canceling edit
  const handleCancelEdit = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingPerson(null);
  }, []);

  // Handle deleting a person
  const handleDeletePerson = useCallback((personId) => {
    if (window.confirm('Are you sure you want to delete this person?')) {
      setNodes((nds) => nds.filter(node => node.id !== personId));
      setEdges((eds) => eds.filter(edge => edge.source !== personId && edge.target !== personId));
    }
  }, [setNodes, setEdges]);

  // Handle saving added relative
  const handleSaveAddedRelative = useCallback((relativeData) => {
    if (!addRelativeSource) return;

    const sourceNode = nodes.find(node => node.id === addRelativeSource.id);
    if (!sourceNode) return;

    const newId = `${Date.now()}`;
    const newPersonGender = relativeData.biologicalSex;
    const sourceGender = sourceNode.data.biologicalSex || 'unknown';

    // Create new person node
    const newNode = {
      id: newId,
      type: 'person',
      position: { 
        x: sourceNode.position.x + 200, 
        y: sourceNode.position.y + (Math.random() - 0.5) * 200 
      },
      data: {
        name: relativeData.name,
        biologicalSex: relativeData.biologicalSex,
        birthDate: relativeData.birthDate,
        deathDate: relativeData.deathDate,
        location: relativeData.location,
        occupation: relativeData.occupation,
        notes: relativeData.notes,
      },
    };

    // Create edge based on relationship type
    let edgeConfig = null;
    switch (relativeData.relationshipType) {
      case 'biological-parent':
        edgeConfig = {
          id: `edge-${newId}-${addRelativeSource.id}`,
          source: newId,
          target: addRelativeSource.id,
          label: newPersonGender === 'male' ? 'Father' : 'Mother',
          type: 'smoothstep',
          style: { 
            stroke: '#6ede87', 
            strokeWidth: 2,
            strokeDasharray: 'none'
          }
        };
        break;
      case 'adopted-parent':
        edgeConfig = {
          id: `edge-${newId}-${addRelativeSource.id}`,
          source: newId,
          target: addRelativeSource.id,
          label: newPersonGender === 'male' ? 'Adoptive Father' : 'Adoptive Mother',
          type: 'smoothstep',
          style: { 
            stroke: '#ffa500', 
            strokeWidth: 2,
            strokeDasharray: '5,5'
          }
        };
        break;
      case 'biological-child':
        edgeConfig = {
          id: `edge-${addRelativeSource.id}-${newId}`,
          source: addRelativeSource.id,
          target: newId,
          label: newPersonGender === 'male' ? 'Son' : 'Daughter',
          type: 'smoothstep',
          style: { 
            stroke: '#6ede87', 
            strokeWidth: 2,
            strokeDasharray: 'none'
          }
        };
        break;
      case 'adopted-child':
        edgeConfig = {
          id: `edge-${addRelativeSource.id}-${newId}`,
          source: addRelativeSource.id,
          target: newId,
          label: newPersonGender === 'male' ? 'Adopted Son' : 'Adopted Daughter',
          type: 'smoothstep',
          style: { 
            stroke: '#ffa500', 
            strokeWidth: 2,
            strokeDasharray: '5,5'
          }
        };
        break;
      case 'spouse':
        edgeConfig = {
          id: `edge-${newId}-${addRelativeSource.id}`,
          source: newId,
          target: addRelativeSource.id,
          label: sourceGender === 'male' && newPersonGender === 'female' ? 'Wife' : 
                 sourceGender === 'female' && newPersonGender === 'male' ? 'Husband' : 'Spouse',
          type: 'smoothstep',
          style: { 
            stroke: '#e24a90', 
            strokeWidth: 2,
            strokeDasharray: '3,3'
          }
        };
        break;
      default:
        break;
    }

    // Add the node and edge
    setNodes((nds) => [...nds, newNode]);
    if (edgeConfig) {
      setEdges((eds) => [...eds, edgeConfig]);
    }

    // Close dialog
    setIsAddRelativeDialogOpen(false);
    setAddRelativeSource(null);
  }, [addRelativeSource, nodes, setNodes, setEdges]);

  // Handle canceling add relative
  const handleCancelAddRelative = useCallback(() => {
    setIsAddRelativeDialogOpen(false);
    setAddRelativeSource(null);
  }, []);



  const handleSave = async () => {
    if (!flowName.trim()) {
      alert('Please enter a flow name');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`http://localhost:3001/api/flows/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: flowName,
          description: flowDescription,
          nodes,
          edges,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Ancestry chart updated successfully!');
        navigate('/');
      } else {
        throw new Error(result.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error updating ancestry chart:', error);
      alert('Failed to update ancestry chart. Please try again.');
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
    if (window.confirm('Are you sure you want to delete this ancestry chart? This action cannot be undone.')) {
      try {
        // Here you would make an API call to delete the flow
        console.log('Deleting ancestry chart:', id);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        alert('Ancestry chart deleted successfully!');
        navigate('/');
      } catch (error) {
        console.error('Error deleting ancestry chart:', error);
        alert('Failed to delete ancestry chart. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="edit-flow-container">
        <div className="loading">Loading ancestry chart...</div>
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
            Back to Chart List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-flow-container">
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
              {isLinkingMode ? (
                <span style={{ color: '#ffa500' }}>� Click on another person to create a relationship</span>
              ) : (
                <span>💡 Click on a person to see available actions</span>
              )}
            </div>
          </div>
          <div className="toolbar-right">
            {isLinkingMode && (
              <button onClick={handleCancelLinking} className="cancel-linking-button" style={{ marginRight: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                ❌ Cancel Linking
              </button>
            )}
            <button onClick={handleDelete} className="delete-flow-button">
              🗑️ Delete Chart
            </button>
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
                onLink: handleLinkRelative,
                onNodeClickForLinking: handleNodeClickForLinking,
                isLinkingMode,
                isInLinkingMode: isLinkingMode,
                linkingSourceId,
                isLinkingSource: linkingSourceId === node.id
              }
            }))}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClickForLinking}
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
          {saving ? 'Saving...' : 'Update Chart'}
        </button>
      </div>

      <PersonEditDialog
        person={editingPerson}
        isOpen={isEditDialogOpen}
        onSave={handleSaveEditedPerson}
        onCancel={handleCancelEdit}
      />

      <AddRelativeDialog
        isOpen={isAddRelativeDialogOpen}
        onSave={handleSaveAddedRelative}
        onCancel={handleCancelAddRelative}
        sourcePersonData={addRelativeSource}
      />

      <LinkRelationshipDialog
        isOpen={isLinkRelationshipDialogOpen}
        sourcePersonData={linkingSourceData}
        targetPersonData={linkingTargetData}
        onSave={handleSaveLinkRelationship}
        onCancel={handleCancelLinking}
      />
    </div>
  );
};

export default EditFlow;
