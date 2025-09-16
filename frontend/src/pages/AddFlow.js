import React, { useState, useCallback } from 'react';
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
import './AddFlow.css';

const nodeTypes = {
  person: PersonNode,
};

const edgeTypes = {
  relationship: RelationshipEdge,
};

const initialNodes = [
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
  },
];

const initialEdges = [];

const AddFlow = () => {
  const navigate = useNavigate();
  const [flowName, setFlowName] = useState('');
  const [flowDescription, setFlowDescription] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [saving, setSaving] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLinkingMode, setIsLinkingMode] = useState(false);
  const [linkingSourceId, setLinkingSourceId] = useState(null);
  const [linkingSourceData, setLinkingSourceData] = useState(null);

  // Generation-based positioning constants
  const GENERATION_HEIGHT = 200;
  const HORIZONTAL_SPACING = 300;
  const CENTER_X = 400;

  const onConnect = useCallback((params) => {
    console.log('Connection params:', params);
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  // Function to calculate generation level for a person
  const getPersonGeneration = useCallback((personId) => {
    const visited = new Set();
    const queue = [{ id: personId, generation: 0 }];
    
    while (queue.length > 0) {
      const { id, generation } = queue.shift();
      
      if (visited.has(id)) continue;
      visited.add(id);
      
      // Look for parent relationships (edges coming into this node)
      const parentEdges = edges.filter(edge => 
        edge.target === id && 
        edge.style?.stroke === '#6ede87' // Parent-child relationship color
      );
      
      if (parentEdges.length === 0) {
        // This is a root person, return their generation
        return generation;
      }
      
      // Add parents to queue with higher generation
      parentEdges.forEach(edge => {
        queue.push({ id: edge.source, generation: generation + 1 });
      });
    }
    
    return 0; // Default generation
  }, [edges]);

  // Function to get position for new person based on generation
  const getPositionForGeneration = useCallback((generation, direction, parentNode) => {
    // Count existing people in this generation
    const sameGenerationNodes = nodes.filter(node => {
      const nodeGeneration = getPersonGeneration(node.id);
      return Math.abs(nodeGeneration - generation) < 0.1; // Handle floating point comparison
    });
    
    const baseY = CENTER_X + (generation * GENERATION_HEIGHT);
    
    if (direction === 'spouse-left' || direction === 'spouse-right') {
      // For spouses, place them at the same generation level
      const offset = direction === 'spouse-left' ? -HORIZONTAL_SPACING : HORIZONTAL_SPACING;
      return {
        x: parentNode.position.x + offset,
        y: baseY
      };
    }
    
    // For parents/children, find the next available horizontal position
    const occupiedXPositions = sameGenerationNodes.map(node => node.position.x).sort((a, b) => a - b);
    let newX = CENTER_X;
    
    if (occupiedXPositions.length > 0) {
      // Find a gap or place at the end
      const spacing = HORIZONTAL_SPACING;
      for (let i = 0; i < occupiedXPositions.length; i++) {
        const expectedX = CENTER_X + (i * spacing);
        if (occupiedXPositions[i] > expectedX + 50) {
          newX = expectedX;
          break;
        }
      }
      if (newX === CENTER_X) {
        // No gap found, place at the end
        newX = occupiedXPositions[occupiedXPositions.length - 1] + spacing;
      }
    }
    
    return { x: newX, y: baseY };
  }, [nodes, getPersonGeneration]);

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

  const handleAddPerson = useCallback((parentId, direction) => {
    console.log('Adding person:', { parentId, direction });
    
    const parentNode = nodes.find(node => node.id === parentId);
    if (!parentNode) return;

    const newId = `${Date.now()}`;
    const parentGeneration = getPersonGeneration(parentId);
    
    let newGeneration;
    switch (direction) {
      case 'parent':
        newGeneration = parentGeneration + 1;
        break;
      case 'child':
        newGeneration = parentGeneration - 1;
        break;
      case 'spouse-left':
      case 'spouse-right':
        newGeneration = parentGeneration;
        break;
      default:
        newGeneration = parentGeneration;
    }
    
    const newPosition = getPositionForGeneration(newGeneration, direction, parentNode);
    let edgeConfig = null;
    
    // Determine genders for relationship labeling
    const parentGender = parentNode.data.gender || 'unknown';
    const newPersonGender = Math.random() > 0.5 ? 'male' : 'female'; // Random for now

    // Create edge configuration based on direction
    switch (direction) {
      case 'parent':
        edgeConfig = {
          id: `edge-${newId}-${parentId}`,
          source: newId,
          target: parentId,
          sourceHandle: 'bottom',
          targetHandle: 'top',
          type: 'relationship',
          data: { 
            label: getRelationshipLabel(direction, newPersonGender, parentGender),
            relationshipType: 'parent'
          },
          style: { stroke: '#6ede87', strokeWidth: 2 }
        };
        break;
      case 'child':
        edgeConfig = {
          id: `edge-${parentId}-${newId}`,
          source: parentId,
          target: newId,
          sourceHandle: 'bottom',
          targetHandle: 'top',
          type: 'relationship',
          data: { 
            label: getRelationshipLabel(direction, parentGender, newPersonGender),
            relationshipType: 'child'
          },
          style: { stroke: '#6ede87', strokeWidth: 2 }
        };
        break;
      case 'spouse-left':
      case 'spouse-right':
        edgeConfig = {
          id: `edge-${newId}-${parentId}`,
          source: newId,
          target: parentId,
          sourceHandle: direction === 'spouse-left' ? 'right' : 'left',
          targetHandle: direction === 'spouse-left' ? 'left' : 'right',
          type: 'relationship',
          data: { 
            label: getRelationshipLabel(direction, newPersonGender, parentGender),
            relationshipType: 'spouse'
          },
          style: { stroke: '#e24a90', strokeWidth: 2, strokeDasharray: '5,5' }
        };
        break;
    }

    // Create new person node
    const newNode = {
      id: newId,
      type: newPersonGender === 'male' ? 'male' : 'female',
      position: newPosition,
      data: {
        name: 'New Person',
        birthDate: '',
        deathDate: '',
        location: '',
        gender: newPersonGender
      },
    };

    // Add the node and edge
    setNodes((nds) => [...nds, newNode]);
    if (edgeConfig) {
      setEdges((eds) => [...eds, edgeConfig]);
    }
  }, [nodes, setNodes, setEdges]);

  const handleAddRelative = useCallback((parentId, relativeData) => {
    console.log('Adding relative:', { parentId, relativeData });
    
    const parentNode = nodes.find(node => node.id === parentId);
    if (!parentNode) return;

    const newId = `${Date.now()}`;
    const parentGeneration = getPersonGeneration(parentId);
    
    let newGeneration;
    let direction;
    
    // Map relationship type to direction
    switch (relativeData.relationshipType) {
      case 'biological-parent':
      case 'adopted-parent':
        direction = 'parent';
        newGeneration = parentGeneration + 1;
        break;
      case 'biological-child':
      case 'adopted-child':
        direction = 'child';
        newGeneration = parentGeneration - 1;
        break;
      case 'spouse':
        direction = 'spouse-right';
        newGeneration = parentGeneration;
        break;
      default:
        direction = 'spouse-right';
        newGeneration = parentGeneration;
    }
    
    const newPosition = getPositionForGeneration(newGeneration, direction, parentNode);
    let edgeConfig = null;
    
    // Determine genders for relationship labeling
    const parentGender = parentNode.data.biologicalSex || parentNode.data.gender || 'unknown';
    const newPersonGender = relativeData.biologicalSex;

    // Create edge configuration based on relationship type
    switch (relativeData.relationshipType) {
      case 'biological-parent':
      case 'adopted-parent':
        edgeConfig = {
          id: `edge-${newId}-${parentId}`,
          source: newId,
          target: parentId,
          sourceHandle: 'bottom',
          targetHandle: 'top',
          type: 'relationship',
          data: { 
            label: getRelationshipLabel('parent', newPersonGender, parentGender),
            relationshipType: relativeData.relationshipType
          },
          style: { 
            stroke: relativeData.relationshipType === 'adopted-parent' ? '#ffa500' : '#6ede87', 
            strokeWidth: 2,
            strokeDasharray: relativeData.relationshipType === 'adopted-parent' ? '3,3' : 'none'
          }
        };
        break;
      case 'biological-child':
      case 'adopted-child':
        edgeConfig = {
          id: `edge-${parentId}-${newId}`,
          source: parentId,
          target: newId,
          sourceHandle: 'bottom',
          targetHandle: 'top',
          type: 'relationship',
          data: { 
            label: getRelationshipLabel('child', parentGender, newPersonGender),
            relationshipType: relativeData.relationshipType
          },
          style: { 
            stroke: relativeData.relationshipType === 'adopted-child' ? '#ffa500' : '#6ede87', 
            strokeWidth: 2,
            strokeDasharray: relativeData.relationshipType === 'adopted-child' ? '3,3' : 'none'
          }
        };
        break;
      case 'spouse':
        edgeConfig = {
          id: `edge-${newId}-${parentId}`,
          source: newId,
          target: parentId,
          sourceHandle: 'left',
          targetHandle: 'right',
          type: 'relationship',
          data: { 
            label: getRelationshipLabel('spouse', newPersonGender, parentGender),
            relationshipType: 'spouse'
          },
          style: { stroke: '#e24a90', strokeWidth: 2, strokeDasharray: '5,5' }
        };
        break;
    }

    // Create new person node
    const newNode = {
      id: newId,
      type: 'person',
      position: newPosition,
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

    // Add the node and edge
    setNodes((nds) => [...nds, newNode]);
    if (edgeConfig) {
      setEdges((eds) => [...eds, edgeConfig]);
    }
  }, [nodes, setNodes, setEdges]);

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

  const handleCreateLink = useCallback((sourceId, targetId, relationshipType) => {
    const sourceNode = nodes.find(n => n.id === sourceId);
    const targetNode = nodes.find(n => n.id === targetId);
    
    if (!sourceNode || !targetNode) return;

    const sourceGender = sourceNode.data.biologicalSex || 'unknown';
    const targetGender = targetNode.data.biologicalSex || 'unknown';

    // Create edge configuration
    let edgeConfig;
    switch (relationshipType) {
      case 'biological-parent':
      case 'adopted-parent':
        edgeConfig = {
          id: `edge-${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          sourceHandle: 'bottom',
          targetHandle: 'top',
          type: 'relationship',
          data: { 
            label: getRelationshipLabel('parent', sourceGender, targetGender),
            relationshipType: relationshipType
          },
          style: { 
            stroke: relationshipType === 'adopted-parent' ? '#ffa500' : '#6ede87', 
            strokeWidth: 2,
            strokeDasharray: relationshipType === 'adopted-parent' ? '3,3' : 'none'
          }
        };
        break;
      case 'biological-child':
      case 'adopted-child':
        edgeConfig = {
          id: `edge-${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          sourceHandle: 'bottom',
          targetHandle: 'top',
          type: 'relationship',
          data: { 
            label: getRelationshipLabel('child', sourceGender, targetGender),
            relationshipType: relationshipType
          },
          style: { 
            stroke: relationshipType === 'adopted-child' ? '#ffa500' : '#6ede87', 
            strokeWidth: 2,
            strokeDasharray: relationshipType === 'adopted-child' ? '3,3' : 'none'
          }
        };
        break;
      case 'spouse':
        edgeConfig = {
          id: `edge-${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          sourceHandle: 'right',
          targetHandle: 'left',
          type: 'relationship',
          data: { 
            label: getRelationshipLabel('spouse', sourceGender, targetGender),
            relationshipType: 'spouse'
          },
          style: { stroke: '#e24a90', strokeWidth: 2, strokeDasharray: '5,5' }
        };
        break;
    }

    if (edgeConfig) {
      setEdges((eds) => [...eds, edgeConfig]);
    }

    // Exit linking mode
    handleCancelLinking();
  }, [nodes, setEdges, handleCancelLinking]);

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

  // Handle deleting a person
  const handleDeletePerson = useCallback((personId) => {
    if (window.confirm('Are you sure you want to delete this person?')) {
      setNodes((nds) => nds.filter(node => node.id !== personId));
      setEdges((eds) => eds.filter(edge => edge.source !== personId && edge.target !== personId));
    }
  }, [setNodes, setEdges]);

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
                switch(node.type) {
                  case 'male': return '#4a90e2';
                  case 'female': return '#e24a90';
                  default: return '#6ede87';
                }
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
