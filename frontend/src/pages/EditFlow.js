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
import MarriageNode from '../nodes/MarriageNode';
import PersonEditDialog from '../components/PersonEditDialog';
import AddRelativeDialog from '../components/AddRelativeDialog';
import LinkRelationshipDialog from '../components/LinkRelationshipDialog';
import MarriageEditDialog from '../components/MarriageEditDialog';
import RelationshipEdge from '../edges/RelationshipEdge';
import { getEdgeStyleForRelationship } from '../constants/relationships';
import { RelationshipEdgeService } from '../services/RelationshipEdgeService';
import { FamilyTreeNodeService } from '../services/FamilyTreeNodeService';
import { useFamilyTreeOperations } from '../hooks/useFamilyTreeOperations';
import { useLinkingMode } from '../hooks/useLinkingMode';
import './EditFlow.css';

// Custom node types for ancestry
const nodeTypes = {
  person: PersonNode,
  marriage: MarriageNode,
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
  const [isMarriageEditDialogOpen, setIsMarriageEditDialogOpen] = useState(false);
  const [editingMarriage, setEditingMarriage] = useState(null);

  // Initialize hooks for family tree operations
  const familyTreeOps = useFamilyTreeOperations(nodes, edges, setNodes, setEdges);
  const linkingMode = useLinkingMode();

  // Simplified handlers using services
  const handleAddPerson = familyTreeOps.handleAddPerson;
  const handleDeletePerson = familyTreeOps.handleDeletePerson;

  // Enhance edges with delete functionality
  const enhancedEdges = edges.map(edge => ({
    ...edge,
    data: {
      ...edge.data,
      onDelete: familyTreeOps.handleDeleteEdge
    }
  }));

  useEffect(() => {
    loadFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadFlow = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/flows/${id}`, {
        credentials: 'include'
      });
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

  // Disable manual edge creation - edges should only be created through Add Relative or Link Relative
  const onConnect = useCallback(() => {
    // Prevent manual edge creation
    console.log('Manual edge creation disabled. Use Add Relative or Link Relative buttons.');
  }, []);

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

  // Handle creating/editing marriage
  const handleEditMarriage = useCallback((marriageId, marriageData) => {
    setEditingMarriage({ id: marriageId, ...marriageData });
    setIsMarriageEditDialogOpen(true);
  }, []);

  const handleDeleteMarriage = useCallback((marriageId) => {
    if (window.confirm('Are you sure you want to delete this marriage?')) {
      setNodes(nodes => nodes.filter(node => node.id !== marriageId));
      // TODO: Also delete related edges
    }
  }, []);

  const handleAddChildToMarriage = useCallback((marriageId, marriageData) => {
    // Create a new child person and show edit dialog
    const childId = `person-${Date.now()}-child`;
    const newChild = {
      id: childId,
      type: 'person',
      data: {
        name: 'New Child',
        biologicalSex: 'male',
        birthDate: '',
        deathDate: '',
        location: '',
        occupation: '',
        notes: ''
      },
      position: { x: 300, y: 400 }
    };
    
    // Add the child node
    setNodes(nodes => [...nodes, newChild]);
    
    // Create edge from marriage to child
    const childEdge = {
      id: `edge-${marriageId}-${childId}`,
      source: marriageId,
      target: childId,
      type: 'relationship',
      data: {
        relationshipType: 'PARENT_CHILD',
        sourceLabel: 'parents of',
        targetLabel: 'child of',
        isDirectional: true
      }
    };
    
    setEdges(edges => [...edges, childEdge]);
    
    // Open edit dialog for the new child
    setEditingPerson({ id: childId, ...newChild.data });
    setIsEditDialogOpen(true);
    
    // Update node counter
    setNodeIdCounter(prev => prev + 1);
  }, []);

  const handleAddRelative = useCallback((sourceId, sourceData) => {
    setAddRelativeSource({ id: sourceId, ...sourceData });
    setIsAddRelativeDialogOpen(true);
  }, []);

  const handleAddSpouse = useCallback((sourceId, sourceData) => {
    // Create a marriage with the person and a new spouse
    setEditingMarriage(null);
    setIsMarriageEditDialogOpen(true);
    // Store the source person to pre-populate the marriage dialog
    setAddRelativeSource({ id: sourceId, ...sourceData });
  }, []);

  const handleAddParents = useCallback((sourceId, sourceData) => {
    // Create both parents and a marriage node automatically
    const fatherId = `person-${Date.now()}-father`;
    const motherId = `person-${Date.now()}-mother`;
    const marriageId = `marriage-${Date.now()}-parents`;
    
    // Create father
    const father = {
      id: fatherId,
      type: 'person',
      data: {
        name: 'Father',
        biologicalSex: 'male',
        birthDate: '',
        deathDate: '',
        location: '',
        occupation: '',
        notes: '',
        onEdit: handleEditPerson,
        onDelete: handleDeletePerson,
        onAddRelative: handleAddRelative,
        onAddSpouse: handleAddSpouse,
        onAddParents: handleAddParents,
        onLink: handleLinkRelative,
        isLinkingMode,
        linkingSourceId
      },
      position: { x: 100, y: 50 }
    };
    
    // Create mother
    const mother = {
      id: motherId,
      type: 'person',
      data: {
        name: 'Mother',
        biologicalSex: 'female',
        birthDate: '',
        deathDate: '',
        location: '',
        occupation: '',
        notes: '',
        onEdit: handleEditPerson,
        onDelete: handleDeletePerson,
        onAddRelative: handleAddRelative,
        onAddSpouse: handleAddSpouse,
        onAddParents: handleAddParents,
        onLink: handleLinkRelative,
        isLinkingMode,
        linkingSourceId
      },
      position: { x: 300, y: 50 }
    };
    
    // Create marriage between parents
    const marriage = {
      id: marriageId,
      type: 'marriage',
      data: {
        husbandId: fatherId,
        husbandName: 'Father',
        wifeId: motherId,
        wifeName: 'Mother',
        marriageDate: '',
        separationDate: '',
        location: '',
        notes: '',
        onEdit: handleEditMarriage,
        onAddChild: handleAddChildToMarriage,
        onDelete: handleDeleteMarriage
      },
      position: { x: 200, y: 100 }
    };
    
    // Add all three nodes
    setNodes(nodes => [...nodes, father, mother, marriage]);
    
    // Create edges: father-marriage, mother-marriage, marriage-child
    const fatherToMarriage = {
      id: `edge-${fatherId}-${marriageId}`,
      source: fatherId,
      target: marriageId,
      type: 'relationship',
      data: {
        relationshipType: 'MARRIAGE',
        sourceLabel: 'husband of',
        targetLabel: 'spouse of',
        isDirectional: false
      }
    };
    
    const motherToMarriage = {
      id: `edge-${motherId}-${marriageId}`,
      source: motherId,
      target: marriageId,
      type: 'relationship',
      data: {
        relationshipType: 'MARRIAGE',
        sourceLabel: 'wife of',
        targetLabel: 'spouse of',
        isDirectional: false
      }
    };
    
    const marriageToChild = {
      id: `edge-${marriageId}-${sourceId}`,
      source: marriageId,
      target: sourceId,
      type: 'relationship',
      data: {
        relationshipType: 'PARENT_CHILD',
        sourceLabel: 'parents of',
        targetLabel: 'child of',
        isDirectional: true
      }
    };
    
    setEdges(edges => [...edges, fatherToMarriage, motherToMarriage, marriageToChild]);
    
    // Update counter for new nodes
    setNodeIdCounter(prev => prev + 3);
  }, [handleEditPerson, handleDeletePerson, handleAddRelative, handleAddSpouse, handleLinkRelative, isLinkingMode, linkingSourceId, handleEditMarriage, handleAddChildToMarriage, handleDeleteMarriage]);

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
        nds.map(node => {
          // Update the person node
          if (node.id === editingPerson.id) {
            return { ...node, data: { ...node.data, ...editedData } };
          }
          
          // Update marriage nodes if this person is husband or wife
          if (node.type === 'marriage') {
            const updatedMarriage = { ...node };
            
            if (node.data.husbandId === editingPerson.id && editedData.name) {
              updatedMarriage.data = {
                ...updatedMarriage.data,
                husbandName: editedData.name
              };
            }
            
            if (node.data.wifeId === editingPerson.id && editedData.name) {
              updatedMarriage.data = {
                ...updatedMarriage.data,
                wifeName: editedData.name
              };
            }
            
            return updatedMarriage;
          }
          
          return node;
        })
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

  // Handle saving link relationship - simplified using service
  const handleSaveLinkRelationship = useCallback((relationshipData) => {
    if (linkingSourceId && linkingTargetId) {
      // Extract relationship type from the object
      const relationshipType = typeof relationshipData === 'object' 
        ? relationshipData.relationshipType 
        : relationshipData;
      
      // Use service to create link through the hook
      familyTreeOps.handleCreateLink(linkingSourceId, linkingTargetId, relationshipType, relationshipData);
    }

    // Reset linking state
    setIsLinkingMode(false);
    setLinkingSourceId(null);
    setLinkingSourceData(null);
    setLinkingTargetId(null);
    setLinkingTargetData(null);
    setIsLinkRelationshipDialogOpen(false);
  }, [linkingSourceId, linkingTargetId, familyTreeOps]);

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

  // Handle saving added relative - simplified using service
  const handleSaveAddedRelative = useCallback((relativeData) => {
    if (!addRelativeSource) return;

    // Use service to add relative through the hook
    familyTreeOps.handleAddRelative(addRelativeSource.id, relativeData);

    // Close dialog
    setIsAddRelativeDialogOpen(false);
    setAddRelativeSource(null);
  }, [addRelativeSource, familyTreeOps]);

  // Handle canceling add relative
  const handleCancelAddRelative = useCallback(() => {
    setIsAddRelativeDialogOpen(false);
    setAddRelativeSource(null);
  }, []);

  // Handle creating/editing marriage
  const handleCreateMarriage = useCallback(() => {
    setEditingMarriage(null);
    setIsMarriageEditDialogOpen(true);
  }, []);

  const handleEditMarriage = useCallback((marriageId, marriageData) => {
    setEditingMarriage({ id: marriageId, ...marriageData });
    setIsMarriageEditDialogOpen(true);
  }, []);

  const handleSaveMarriage = useCallback((marriageData) => {
    // Create marriage node
    const marriageId = editingMarriage?.id || `marriage-${Date.now()}`;
    
    if (editingMarriage) {
      // Update existing marriage
      setNodes(nodes => nodes.map(node => 
        node.id === marriageId 
          ? { ...node, data: { ...node.data, ...marriageData } }
          : node
      ));
    } else {
      // Create new marriage node
      const newMarriage = {
        id: marriageId,
        type: 'marriage',
        position: { x: 300, y: 300 },
        data: {
          ...marriageData,
          onEdit: handleEditMarriage,
          onAddChild: handleAddChildToMarriage,
          onDelete: handleDeleteMarriage
        }
      };

      // Check if we need to create new spouse persons
      const husbandExists = nodes.find(n => n.id === marriageData.husbandId);
      const wifeExists = nodes.find(n => n.id === marriageData.wifeId);
      
      const newNodes = [newMarriage];
      const newEdges = [];
      
      // Create husband if doesn't exist
      if (!husbandExists && marriageData.husbandName) {
        const husbandId = marriageData.husbandId || `person-${Date.now()}-husband`;
        const newHusband = {
          id: husbandId,
          type: 'person',
          position: { x: 150, y: 250 },
          data: {
            name: marriageData.husbandName,
            biologicalSex: 'male',
            birthDate: '',
            deathDate: '',
            location: '',
            occupation: '',
            notes: '',
            onEdit: handleEditPerson,
            onDelete: handleDeletePerson,
            onAddRelative: handleAddRelative,
            onAddSpouse: handleAddSpouse,
            onAddParents: handleAddParents,
            onLink: handleLinkRelative,
            isLinkingMode,
            linkingSourceId
          }
        };
        newNodes.push(newHusband);
        
        // Update marriageData to include the correct ID
        marriageData.husbandId = husbandId;
        newMarriage.data.husbandId = husbandId;
      }
      
      // Create wife if doesn't exist  
      if (!wifeExists && marriageData.wifeName) {
        const wifeId = marriageData.wifeId || `person-${Date.now()}-wife`;
        const newWife = {
          id: wifeId,
          type: 'person',
          position: { x: 450, y: 250 },
          data: {
            name: marriageData.wifeName,
            biologicalSex: 'female',
            birthDate: '',
            deathDate: '',
            location: '',
            occupation: '',
            notes: '',
            onEdit: handleEditPerson,
            onDelete: handleDeletePerson,
            onAddRelative: handleAddRelative,
            onAddSpouse: handleAddSpouse,
            onAddParents: handleAddParents,
            onLink: handleLinkRelative,
            isLinkingMode,
            linkingSourceId
          }
        };
        newNodes.push(newWife);
        
        // Update marriageData to include the correct ID
        marriageData.wifeId = wifeId;
        newMarriage.data.wifeId = wifeId;
      }
      
      // Create edges connecting spouses to marriage
      if (marriageData.husbandId) {
        const husbandEdge = {
          id: `edge-${marriageData.husbandId}-${marriageId}`,
          source: marriageData.husbandId,
          target: marriageId,
          type: 'relationship',
          data: {
            relationshipType: 'MARRIAGE',
            sourceLabel: 'husband of',
            targetLabel: 'spouse of',
            isDirectional: false
          }
        };
        newEdges.push(husbandEdge);
      }
      
      if (marriageData.wifeId) {
        const wifeEdge = {
          id: `edge-${marriageData.wifeId}-${marriageId}`,
          source: marriageData.wifeId,
          target: marriageId,
          type: 'relationship',
          data: {
            relationshipType: 'MARRIAGE',
            sourceLabel: 'wife of',
            targetLabel: 'spouse of',
            isDirectional: false
          }
        };
        newEdges.push(wifeEdge);
      }
      
      // Add all new nodes and edges
      setNodes(nodes => [...nodes, ...newNodes]);
      setEdges(edges => [...edges, ...newEdges]);
    }

    setIsMarriageEditDialogOpen(false);
    setEditingMarriage(null);
    setAddRelativeSource(null); // Clear the source person
  }, [editingMarriage, nodes, isLinkingMode, linkingSourceId, handleEditMarriage, handleAddChildToMarriage, handleDeleteMarriage, handleEditPerson, handleDeletePerson, handleAddRelative, handleAddSpouse, handleAddParents, handleLinkRelative]);

  const handleCancelMarriage = useCallback(() => {
    setIsMarriageEditDialogOpen(false);
    setEditingMarriage(null);
  }, []);

  const handleAddChildToMarriage = useCallback((marriageId, marriageData) => {
    // Create a new child person and show edit dialog
    const childId = `person-${Date.now()}-child`;
    const newChild = {
      id: childId,
      type: 'person',
      data: {
        name: 'New Child',
        biologicalSex: 'male',
        birthDate: '',
        deathDate: '',
        location: '',
        occupation: '',
        notes: ''
      },
      position: { x: 300, y: 400 }
    };
    
    // Add the child node
    setNodes(nodes => [...nodes, newChild]);
    
    // Create edge from marriage to child
    const childEdge = {
      id: `edge-${marriageId}-${childId}`,
      source: marriageId,
      target: childId,
      type: 'relationship',
      data: {
        relationshipType: 'PARENT_CHILD',
        sourceLabel: 'parents of',
        targetLabel: 'child of',
        isDirectional: true
      }
    };
    
    setEdges(edges => [...edges, childEdge]);
    
    // Open edit dialog for the new child
    setEditingPerson({ id: childId, ...newChild.data });
    setIsEditDialogOpen(true);
    
    // Update node counter
    setNodeIdCounter(prev => prev + 1);
  }, []);

  const handleDeleteMarriage = useCallback((marriageId) => {
    if (window.confirm('Are you sure you want to delete this marriage?')) {
      setNodes(nodes => nodes.filter(node => node.id !== marriageId));
      // TODO: Also delete related edges
    }
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
        credentials: 'include',
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
            <button onClick={handleCreateMarriage} className="add-marriage-button">
              💒 Add Marriage
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
                onAddSpouse: handleAddSpouse,
                onAddParents: handleAddParents,
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
            edges={enhancedEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClickForLinking}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectOnClick={false}
            connectionMode="strict"
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
        sourcePerson={linkingSourceData}
        targetPerson={linkingTargetData}
        onSave={handleSaveLinkRelationship}
        onCancel={handleCancelLinking}
      />

      <MarriageEditDialog
        isOpen={isMarriageEditDialogOpen}
        marriageData={editingMarriage}
        availablePeople={nodes.filter(node => node.type === 'person')}
        sourcePerson={addRelativeSource}
        onSave={handleSaveMarriage}
        onCancel={handleCancelMarriage}
      />
    </div>
  );
};

export default EditFlow;
