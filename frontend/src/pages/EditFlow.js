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

  // Handle editing a person (moved early to avoid use-before-define)
  const handleEditPerson = useCallback((personId, personData) => {
    setEditingPerson({ id: personId, ...personData });
    setIsEditDialogOpen(true);
  }, []);

  // Handle link relative button click (moved early to avoid use-before-define)
  const handleLinkRelative = useCallback((sourceId, sourceData) => {
    setIsLinkingMode(true);
    setLinkingSourceId(sourceId);
    setLinkingSourceData(sourceData);
  }, []);

  // Smart positioning utility functions
  const getNodeBounds = useCallback(() => {
    if (nodes.length === 0) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    
    const positions = nodes.map(node => ({
      x: node.position.x,
      y: node.position.y,
      width: 202, // Standard node width
      height: 122 // Standard node height
    }));

    return {
      minX: Math.min(...positions.map(p => p.x)),
      maxX: Math.max(...positions.map(p => p.x + p.width)),
      minY: Math.min(...positions.map(p => p.y)),
      maxY: Math.max(...positions.map(p => p.y + p.height))
    };
  }, [nodes]);

  const findOptimalSpousePosition = useCallback((sourceNode, nodes) => {
    const sourcePos = sourceNode.position;
    const nodeWidth = 202;
    const nodeHeight = 122;
    const horizontalGap = 50;
    
    // Try to position to the right first
    const rightPosition = { x: sourcePos.x + nodeWidth + horizontalGap, y: sourcePos.y };
    
    // Check if there's a collision to the right
    const hasCollisionRight = nodes.some(node => {
      const nodeRight = node.position.x + nodeWidth;
      const nodeBottom = node.position.y + nodeHeight;
      return (
        rightPosition.x < nodeRight &&
        rightPosition.x + nodeWidth > node.position.x &&
        rightPosition.y < nodeBottom &&
        rightPosition.y + nodeHeight > node.position.y
      );
    });
    
    if (!hasCollisionRight) {
      return { 
        spousePosition: rightPosition,
        marriagePosition: { x: sourcePos.x + (nodeWidth + horizontalGap) / 2, y: sourcePos.y + nodeHeight + 20 },
        direction: 'right'
      };
    }
    
    // Try to position to the left
    const leftPosition = { x: sourcePos.x - nodeWidth - horizontalGap, y: sourcePos.y };
    
    const hasCollisionLeft = nodes.some(node => {
      const nodeRight = node.position.x + nodeWidth;
      const nodeBottom = node.position.y + nodeHeight;
      return (
        leftPosition.x < nodeRight &&
        leftPosition.x + nodeWidth > node.position.x &&
        leftPosition.y < nodeBottom &&
        leftPosition.y + nodeHeight > node.position.y
      );
    });
    
    if (!hasCollisionLeft) {
      return {
        spousePosition: leftPosition,
        marriagePosition: { x: leftPosition.x + (nodeWidth + horizontalGap) / 2, y: sourcePos.y + nodeHeight + 20 },
        direction: 'left'
      };
    }
    
    // If both sides are blocked, push nodes to make space on the right
    return {
      spousePosition: rightPosition,
      marriagePosition: { x: sourcePos.x + (nodeWidth + horizontalGap) / 2, y: sourcePos.y + nodeHeight + 20 },
      direction: 'right',
      needsSpaceClearing: true
    };
  }, []);

  const pushNodesForSpace = useCallback((affectedArea, direction, pushDistance) => {
    setNodes(currentNodes => 
      currentNodes.map(node => {
        const nodeRight = node.position.x + 202;
        const nodeBottom = node.position.y + 122;
        
        // Check if node is in the affected area
        const isInArea = (
          affectedArea.x < nodeRight &&
          affectedArea.x + 202 > node.position.x &&
          affectedArea.y < nodeBottom &&
          affectedArea.y + 122 > node.position.y
        );
        
        if (isInArea) {
          return {
            ...node,
            position: {
              x: direction === 'right' ? node.position.x + pushDistance : node.position.x - pushDistance,
              y: node.position.y
            }
          };
        }
        return node;
      })
    );
  }, []);

  const findOptimalChildPosition = useCallback((marriageNode, nodes) => {
    const marriagePos = marriageNode.position;
    const nodeWidth = 202;
    const nodeHeight = 122;
    const verticalGap = 60;
    
    // Find all children of this marriage
    const marriageChildren = edges
      .filter(edge => edge.source === marriageNode.id && edge.data?.relationshipType === 'PARENT_CHILD')
      .map(edge => nodes.find(node => node.id === edge.target))
      .filter(Boolean);
    
    // Position new child in a row below marriage, aligned horizontally with existing children
    const baseY = marriagePos.y + nodeHeight + verticalGap;
    
    if (marriageChildren.length === 0) {
      // First child - center under marriage
      return { x: marriagePos.x, y: baseY };
    }
    
    // Position next to existing children
    const childrenXPositions = marriageChildren.map(child => child.position.x);
    const minChildX = Math.min(...childrenXPositions);
    const maxChildX = Math.max(...childrenXPositions);
    
    // Try to add to the right of existing children
    const rightPosition = { x: maxChildX + nodeWidth + 30, y: baseY };
    
    // Check for collisions
    const hasCollision = nodes.some(node => {
      if (marriageChildren.includes(node)) return false; // Don't check against siblings
      const nodeRight = node.position.x + nodeWidth;
      const nodeBottom = node.position.y + nodeHeight;
      return (
        rightPosition.x < nodeRight &&
        rightPosition.x + nodeWidth > node.position.x &&
        rightPosition.y < nodeBottom &&
        rightPosition.y + nodeHeight > node.position.y
      );
    });
    
    if (!hasCollision) {
      return rightPosition;
    }
    
    // If right is blocked, try left
    const leftPosition = { x: minChildX - nodeWidth - 30, y: baseY };
    return leftPosition;
  }, [edges]);

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
        
        // Enhance edges with labels if missing
        const enhancedEdges = flowData.edges.map(edge => {
          const edgeData = edge.data || {};
          
          // If edge already has dual labels, use them
          if (edgeData.sourceLabel && edgeData.targetLabel) {
            return edge;
          }
          
          // If edge has legacy label, keep it
          if (edgeData.label) {
            return edge;
          }
          
          // Generate labels based on relationship type
          let sourceLabel = 'related to';
          let targetLabel = 'related to';
          
          if (edgeData.relationshipType === 'PARENT_CHILD') {
            sourceLabel = 'parent of';
            targetLabel = 'child of';
          } else if (edgeData.relationshipType === 'MARRIAGE') {
            sourceLabel = 'spouse of';
            targetLabel = 'spouse of';
          }
          
          return {
            ...edge,
            data: {
              ...edgeData,
              sourceLabel,
              targetLabel
            }
          };
        });
        
        setEdges(enhancedEdges);
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
    // Find the marriage node
    const marriageNode = nodes.find(n => n.id === marriageId);
    
    // Calculate optimal child position
    const childPosition = marriageNode 
      ? findOptimalChildPosition(marriageNode, nodes)
      : { x: 300, y: 400 };
    
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
      position: childPosition
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
  }, [nodes, findOptimalChildPosition]);

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
      // Get the source person (who triggered adding spouse)
      const sourcePerson = addRelativeSource ? nodes.find(n => n.id === addRelativeSource.id) : null;
      
      // Calculate smart positioning
      const positioning = sourcePerson 
        ? findOptimalSpousePosition(sourcePerson, nodes)
        : { 
            spousePosition: { x: 300, y: 300 }, 
            marriagePosition: { x: 300, y: 400 },
            direction: 'right'
          };

      // Create new marriage node
      const newMarriage = {
        id: marriageId,
        type: 'marriage',
        position: positioning.marriagePosition,
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
      
      // Determine which person is the source (existing) and which is the new spouse
      const isSourceHusband = sourcePerson && sourcePerson.data.biologicalSex === 'male';
      
      // Create husband if doesn't exist
      if (!husbandExists && marriageData.husbandName) {
        const husbandId = marriageData.husbandId || `person-${Date.now()}-husband`;
        const husbandPosition = isSourceHusband ? sourcePerson.position : positioning.spousePosition;
        
        const newHusband = {
          id: husbandId,
          type: 'person',
          position: husbandPosition,
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
        const isSourceWife = sourcePerson && sourcePerson.data.biologicalSex === 'female';
        const wifePosition = isSourceWife ? sourcePerson.position : positioning.spousePosition;
        
        const newWife = {
          id: wifeId,
          type: 'person',
          position: wifePosition,
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
      
      // Clear space if needed
      if (positioning.needsSpaceClearing) {
        const pushDistance = 252; // Node width + gap
        pushNodesForSpace(positioning.spousePosition, positioning.direction, pushDistance);
      }
      
      // Add all new nodes and edges
      setNodes(nodes => [...nodes, ...newNodes]);
      setEdges(edges => [...edges, ...newEdges]);
    }

    setIsMarriageEditDialogOpen(false);
    setEditingMarriage(null);
    setAddRelativeSource(null); // Clear the source person
  }, [editingMarriage, nodes, isLinkingMode, linkingSourceId, handleEditMarriage, handleAddChildToMarriage, handleDeleteMarriage, handleEditPerson, handleDeletePerson, handleAddRelative, handleAddSpouse, handleAddParents, handleLinkRelative, addRelativeSource, findOptimalSpousePosition, pushNodesForSpace]);

  const handleCancelMarriage = useCallback(() => {
    setIsMarriageEditDialogOpen(false);
    setEditingMarriage(null);
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
                // Conditionally assign handlers based on node type
                onEdit: node.type === 'marriage' ? handleEditMarriage : handleEditPerson,
                onDelete: node.type === 'marriage' ? handleDeleteMarriage : handleDeletePerson,
                onAddChild: node.type === 'marriage' ? handleAddChildToMarriage : undefined,
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
