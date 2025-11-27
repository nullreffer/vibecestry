import { useCallback } from 'react';
import { FamilyTreeNodeService } from '../services/FamilyTreeNodeService';
import { RelationshipEdgeService } from '../services/RelationshipEdgeService';

/**
 * Custom hook for managing family tree operations
 */
export const useFamilyTreeOperations = (nodes, edges, setNodes, setEdges) => {
  
  // Add a new person to the family tree
  const handleAddPerson = useCallback((parentId, direction) => {
    const result = FamilyTreeNodeService.addNewPerson(parentId, direction, nodes, edges);
    if (result) {
      setNodes(nds => [...nds, result.node]);
      setEdges(eds => [...eds, result.edge]);
    }
  }, [nodes, edges, setNodes, setEdges]);

  // Add a relative with specific data
  const handleAddRelative = useCallback((parentId, relativeData) => {
    const result = FamilyTreeNodeService.addRelative(parentId, relativeData, nodes, edges);
    if (result) {
      setNodes(nds => [...nds, result.node]);
      setEdges(eds => [...eds, result.edge]);
    }
  }, [nodes, edges, setNodes, setEdges]);

  // Create a link between existing nodes
  const handleCreateLink = useCallback((sourceId, targetId, relationshipType, relationshipData = null) => {
    const newEdge = FamilyTreeNodeService.createLink(sourceId, targetId, relationshipType, nodes, relationshipData);
    if (newEdge) {
      setEdges(eds => [...eds, newEdge]);
    }
  }, [nodes, setEdges]);

  // Edit person data
  const handleEditPerson = useCallback((personId, newData) => {
    const updatedNodes = FamilyTreeNodeService.updatePersonData(personId, newData, nodes);
    setNodes(updatedNodes);
  }, [nodes, setNodes]);

  // Delete a person
  const handleDeletePerson = useCallback((personId) => {
    if (window.confirm('Are you sure you want to delete this person?')) {
      const result = FamilyTreeNodeService.deletePerson(personId, nodes, edges);
      setNodes(result.nodes);
      setEdges(result.edges);
    }
  }, [nodes, edges, setNodes, setEdges]);

  // Auto-arrange nodes
  const handleAutoArrange = useCallback(() => {
    const arrangedNodes = FamilyTreeNodeService.autoArrangeNodes(nodes, edges);
    setNodes(arrangedNodes);
  }, [nodes, edges, setNodes]);

  // Get family statistics
  const getFamilyStats = useCallback(() => {
    return FamilyTreeNodeService.getFamilyStatistics(nodes, edges);
  }, [nodes, edges]);

  // Validate family tree
  const validateTree = useCallback(() => {
    return FamilyTreeNodeService.validateFamilyTree(nodes, edges);
  }, [nodes, edges]);

  return {
    handleAddPerson,
    handleAddRelative,
    handleCreateLink,
    handleEditPerson,
    handleDeletePerson,
    handleAutoArrange,
    getFamilyStats,
    validateTree
  };
};
