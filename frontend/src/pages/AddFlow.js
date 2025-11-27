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
import MarriageNode from '../nodes/MarriageNode';
import PersonEditDialog from '../components/PersonEditDialog';
import MarriageEditDialog from '../components/MarriageEditDialog';
import RelationshipEdge from '../edges/RelationshipEdge';
import { useFamilyTreeOperations } from '../hooks/useFamilyTreeOperations';
import { useLinkingMode } from '../hooks/useLinkingMode';
import './AddFlow.css';

const nodeTypes = {
  person: PersonNode,
  marriage: MarriageNode,
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
  
  // Marriage dialog state
  const [isMarriageEditDialogOpen, setIsMarriageEditDialogOpen] = useState(false);
  const [editingMarriage, setEditingMarriage] = useState(null);
  const [addSpouseSource, setAddSpouseSource] = useState(null);

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

  // Enhance edges with delete functionality
  const enhancedEdges = edges.map(edge => ({
    ...edge,
    data: {
      ...edge.data,
      onDelete: familyTreeOps.handleDeleteEdge
    }
  }));

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
        console.log('API not available, creating default starting person');
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

  const onConnect = useCallback(() => {
    // Disable manual edge creation - edges should only be created through Add Relative or Link Relative
    console.log('Manual edge creation disabled. Use Add Relative or Link Relative buttons.');
  }, []);

  // Simplified handlers using services
  const handleAddPerson = familyTreeOps.handleAddPerson;
  const handleAddRelative = familyTreeOps.handleAddRelative;
  
  // Add Spouse handler - opens marriage dialog with source person
  const handleAddSpouse = useCallback((sourceId, sourceData) => {
    console.log('Add Spouse for:', sourceId, sourceData);
    setAddSpouseSource({ id: sourceId, ...sourceData });
    setEditingMarriage(null);
    setIsMarriageEditDialogOpen(true);
  }, []);
  
  // Add Parents handler - creates parents and marriage automatically
  const handleAddParents = useCallback((sourceId, sourceData) => {
    console.log('Add Parents for:', sourceId, sourceData);
    
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
        notes: ''
      },
      position: { x: sourceData.position?.x - 150 || 50, y: sourceData.position?.y - 100 || 50 }
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
        notes: ''
      },
      position: { x: sourceData.position?.x + 150 || 350, y: sourceData.position?.y - 100 || 50 }
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
        notes: ''
      },
      position: { x: sourceData.position?.x || 200, y: sourceData.position?.y - 50 || 100 }
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
  }, []);
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
  }, [editingPerson, setNodes]);

  // Handle canceling edit
  const handleCancelEdit = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingPerson(null);
  }, []);

  // Handle linking persons (for future implementation)
  const handleLinkPerson = useCallback((personId, relationship) => {
    // TODO: Implement linking functionality
    const relationshipLabel = relationship.label || relationship.value || String(relationship);
    alert(`Link ${relationshipLabel} functionality coming soon!`);
  }, []);

  // Marriage dialog handlers
  const handleSaveMarriage = useCallback((marriageData) => {
    const marriageId = editingMarriage?.id || `marriage-${Date.now()}`;
    
    if (editingMarriage) {
      // Update existing marriage
      setNodes(nodes => nodes.map(node => 
        node.id === marriageId 
          ? { ...node, data: { ...node.data, ...marriageData } }
          : node
      ));
      
      setIsMarriageEditDialogOpen(false);
      setEditingMarriage(null);
      setAddSpouseSource(null);
      return;
    }
    
    // Create new marriage node
    const newMarriage = {
      id: marriageId,
      type: 'marriage',
      position: { x: 300, y: 300 },
      data: {
        ...marriageData
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
          notes: ''
        }
      };
      newNodes.push(newHusband);
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
          notes: ''
        }
      };
      newNodes.push(newWife);
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

    setIsMarriageEditDialogOpen(false);
    setEditingMarriage(null);
    setAddSpouseSource(null);
  }, [nodes]);

  const handleCancelMarriage = useCallback(() => {
    setIsMarriageEditDialogOpen(false);
    setEditingMarriage(null);
    setAddSpouseSource(null);
  }, []);

  const handleEditMarriage = useCallback((marriageId, marriageData) => {
    setEditingMarriage({ id: marriageId, ...marriageData });
    setAddSpouseSource(null); // Clear any spouse source
    setIsMarriageEditDialogOpen(true);
  }, []);

  const handleDeleteMarriage = useCallback((marriageId) => {
    setNodes(nodes => nodes.filter(node => node.id !== marriageId));
    setEdges(edges => edges.filter(edge => 
      edge.source !== marriageId && edge.target !== marriageId
    ));
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
                // Person node handlers
                ...(node.type === 'person' && {
                  onAddPerson: handleAddPerson,
                  onAddRelative: handleAddRelative,
                  onAddSpouse: handleAddSpouse,
                  onAddParents: handleAddParents,
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
                }),
                // Marriage node handlers
                ...(node.type === 'marriage' && {
                  onEdit: handleEditMarriage,
                  onDelete: handleDeleteMarriage,
                  onAddChild: handleAddChildToMarriage
                })
              }
            }))}
            edges={enhancedEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
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
          {saving ? 'Saving...' : 'Create Chart'}
        </button>
      </div>

      <PersonEditDialog
        person={editingPerson}
        isOpen={isEditDialogOpen}
        onSave={handleSaveEditedPerson}
        onCancel={handleCancelEdit}
      />

      <MarriageEditDialog
        isOpen={isMarriageEditDialogOpen}
        marriageData={editingMarriage}
        availablePeople={nodes.filter(node => node.type === 'person')}
        sourcePerson={addSpouseSource}
        onSave={handleSaveMarriage}
        onCancel={handleCancelMarriage}
      />
    </div>
  );
};

export default AddFlow;
