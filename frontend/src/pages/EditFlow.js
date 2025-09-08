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
import MaleNode from '../nodes/MaleNode';
import FemaleNode from '../nodes/FemaleNode';
import PersonEditDialog from '../components/PersonEditDialog';
import RelationshipEdge from '../edges/RelationshipEdge';
import './EditFlow.css';

// Custom node types for ancestry
const nodeTypes = {
  person: PersonNode,
  male: MaleNode,
  female: FemaleNode,
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

  useEffect(() => {
    loadFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadFlow = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockFlowData = {
        '1': {
          id: '1',
          name: 'Smith Family Tree',
          description: 'A multi-generational family tree',
          nodes: [
            {
              id: '1',
              type: 'male',
              data: { 
                name: 'John Smith',
                birthDate: '1965-03-15',
                location: 'Boston, MA'
              },
              position: { x: 400, y: 200 },
            },
            {
              id: '2',
              type: 'female',
              data: { 
                name: 'Mary Johnson',
                birthDate: '1967-08-22',
                location: 'Boston, MA'
              },
              position: { x: 650, y: 200 },
            },
            {
              id: '3',
              type: 'male',
              data: { 
                name: 'Robert Smith',
                birthDate: '1940-12-05',
                location: 'New York, NY'
              },
              position: { x: 400, y: 50 },
            },
            {
              id: '4',
              type: 'female',
              data: { 
                name: 'Emily Davis',
                birthDate: '1992-05-10',
                location: 'Boston, MA'
              },
              position: { x: 525, y: 350 },
            },
          ],
          edges: [
            { 
              id: 'e1-2', 
              source: '1', 
              target: '2', 
              type: 'relationship',
              data: { label: 'Husband', relationshipType: 'spouse' },
              style: { stroke: '#e24a90', strokeWidth: 3, strokeDasharray: '5,5' }
            },
            { 
              id: 'e3-1', 
              source: '3', 
              target: '1', 
              type: 'relationship',
              data: { label: 'Father', relationshipType: 'parent' },
              animated: true,
              style: { stroke: '#6ede87', strokeWidth: 2 }
            },
            { 
              id: 'e1-4', 
              source: '1', 
              target: '4', 
              type: 'relationship',
              data: { label: 'Father', relationshipType: 'parent' },
              animated: true,
              style: { stroke: '#6ede87', strokeWidth: 2 }
            },
          ],
        },
        '2': {
          id: '2',
          name: 'Johnson Ancestry',
          description: 'Historical family lineage',
          nodes: [
            {
              id: '1',
              type: 'female',
              data: { 
                name: 'Sarah Johnson',
                birthDate: '1945-11-30',
                location: 'Chicago, IL'
              },
              position: { x: 300, y: 150 },
            },
            {
              id: '2',
              type: 'male',
              data: { 
                name: 'Michael Thompson',
                birthDate: '1970-07-18',
                location: 'Chicago, IL'
              },
              position: { x: 300, y: 300 },
            },
            {
              id: '3',
              type: 'female',
              data: { 
                name: 'Lisa Anderson',
                birthDate: '1972-02-14',
                location: 'Milwaukee, WI'
              },
              position: { x: 550, y: 300 },
            },
            {
              id: '4',
              type: 'male',
              data: { 
                name: 'James Thompson',
                birthDate: '2000-09-05',
                location: 'Chicago, IL'
              },
              position: { x: 425, y: 450 },
            },
          ],
          edges: [
            { 
              id: 'e1-2', 
              source: '1', 
              target: '2', 
              type: 'relationship',
              data: { label: 'Mother', relationshipType: 'parent' },
              animated: true,
              style: { stroke: '#6ede87', strokeWidth: 2 }
            },
            { 
              id: 'e2-3', 
              source: '2', 
              target: '3', 
              type: 'relationship',
              data: { label: 'Husband', relationshipType: 'spouse' },
              style: { stroke: '#e24a90', strokeWidth: 3, strokeDasharray: '5,5' }
            },
            { 
              id: 'e2-4', 
              source: '2', 
              target: '4', 
              type: 'relationship',
              data: { label: 'Father', relationshipType: 'parent' },
              animated: true,
              style: { stroke: '#6ede87', strokeWidth: 2 }
            },
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
      birthDate: `${Math.floor(Math.random() * 50) + 1950}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      location: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX'][Math.floor(Math.random() * 4)]
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
    
    // Determine node type based on relationship and random gender
    const newPersonGender = Math.random() > 0.5 ? 'male' : 'female';
    const nodeType = newPersonGender;
    
    const newNode = {
      id: newNodeId,
      type: nodeType,
      data: { ...personData, gender: newPersonGender },
      position: newPosition,
    };

    // Add the new node
    setNodes((nds) => nds.concat(newNode));
    
    // Get source node gender for relationship labeling
    const sourceGender = sourceNode.data.gender || 'unknown';
    
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

  const addNode = () => {
    const newNode = {
      id: String(nodeIdCounter),
      type: Math.random() > 0.5 ? 'male' : 'female',
      data: generatePersonData('parent'),
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

  // Handle canceling edit
  const handleCancelEdit = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingPerson(null);
  }, []);

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

      console.log('Updating ancestry chart:', flowData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Ancestry chart updated successfully!');
      navigate('/');
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
      <div className="page-header">
        <h1>Edit Ancestry Chart</h1>
        <p>Modify your family tree. Hover over people to add family members.</p>
      </div>

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
          <div className="toolbar-right">
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
                onEdit: handleEditPerson
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
          {saving ? 'Saving...' : 'Update Chart'}
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

export default EditFlow;
