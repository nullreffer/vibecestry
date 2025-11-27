import { PositionUtils } from '../utils/PositionUtils';
import { PersonDataUtils } from '../utils/PersonDataUtils';
import { RelationshipEdgeService } from './RelationshipEdgeService';
import { RELATIONSHIP_TYPES } from '../constants/relationships';

/**
 * Service for managing family tree node operations
 */
export class FamilyTreeNodeService {
  
  /**
   * Add a new person to the family tree
   */
  static addNewPerson(parentNodeId, direction, existingNodes, existingEdges) {
    const parentNode = existingNodes.find(node => node.id === parentNodeId);
    if (!parentNode) return null;

    const newId = `${Date.now()}`;
    const parentGeneration = PositionUtils.getPersonGeneration(parentNodeId, existingNodes, existingEdges);
    
    let newGeneration;
    let relationshipType;
    
    switch (direction) {
      case 'parent':
        newGeneration = parentGeneration + 1;
        relationshipType = RELATIONSHIP_TYPES.BIOLOGICAL_PARENT;
        break;
      case 'child':
        newGeneration = parentGeneration - 1;
        relationshipType = RELATIONSHIP_TYPES.BIOLOGICAL_PARENT;
        break;
      case 'spouse':
        newGeneration = parentGeneration;
        relationshipType = RELATIONSHIP_TYPES.SPOUSE;
        break;
      default:
        // No direct sibling relationships allowed - use marriage nodes instead
        console.warn('Direct sibling creation not allowed - use marriage nodes for family structure');
        return null;
    }
    
    const newPosition = PositionUtils.calculateNewPosition(parentNodeId, direction, existingNodes);
    const newPersonData = PersonDataUtils.generatePersonData(direction);
    
    // Create the new node
    const newNode = {
      id: newId,
      type: 'person',
      position: newPosition,
      data: {
        ...newPersonData,
        name: 'New Person'
      }
    };

    // Create the relationship edge
    const newEdge = RelationshipEdgeService.createNewRelativeEdge(
      parentNodeId, 
      newId, 
      relationshipType, 
      parentNode.data, 
      newPersonData, 
      direction
    );

    return {
      node: newNode,
      edge: newEdge
    };
  }

  /**
   * Add a relative with specific data
   */
  static addRelative(parentNodeId, relativeData, existingNodes, existingEdges) {
    // Ensure we have valid arrays to work with
    const safeNodes = Array.isArray(existingNodes) ? existingNodes : [];
    const safeEdges = Array.isArray(existingEdges) ? existingEdges : [];
    
    const parentNode = safeNodes.find(node => node.id === parentNodeId);
    if (!parentNode) return null;

    const newId = `${Date.now()}`;
    const parentGeneration = PositionUtils.getPersonGeneration(parentNodeId, safeNodes, safeEdges);
    
    let newGeneration;
    let direction;
    
    // Map relationship type and direction from the simplified dialog
    const relationshipDirection = relativeData.relationshipDirection || 'bidirectional';
    
    if (relationshipDirection === 'parent-to-child') {
      // Parent being added to the current person
      direction = 'parent';
      newGeneration = parentGeneration + 1;
    } else if (relationshipDirection === 'child-to-parent') {
      // Child being added to the current person
      direction = 'child';
      newGeneration = parentGeneration - 1;
    } else if (relativeData.relationshipType === RELATIONSHIP_TYPES.SPOUSE) {
      direction = 'spouse';
      newGeneration = parentGeneration;
    } else {
      // No direct sibling relationships allowed - use marriage nodes instead
      console.warn('Direct sibling creation not allowed - use marriage nodes for family structure');
      return null;
    }
    
    const newPosition = PositionUtils.calculateNewPosition(parentNodeId, direction, existingNodes);
    
    // Create the new node
    const newNode = {
      id: newId,
      type: 'person',
      position: newPosition,
      data: {
        name: relativeData.name,
        biologicalSex: relativeData.biologicalSex,
        birthDate: relativeData.birthDate,
        deathDate: relativeData.deathDate || '',
        location: relativeData.location || '',
        occupation: relativeData.occupation || '',
        notes: relativeData.notes || ''
      }
    };

    // Create the relationship edge
    const newEdge = RelationshipEdgeService.createNewRelativeEdge(
      parentNodeId, 
      newId, 
      relativeData.relationshipType, 
      parentNode.data, 
      newNode.data, 
      direction
    );

    return {
      node: newNode,
      edge: newEdge
    };
  }

  /**
   * Create a link between two existing nodes
   */
  static createLink(sourceId, targetId, relationshipType, existingNodes, relationshipData = null) {
    const sourceNode = existingNodes.find(n => n.id === sourceId);
    const targetNode = existingNodes.find(n => n.id === targetId);
    
    if (!sourceNode || !targetNode) return null;

    // Determine direction for dual labels
    let direction = 'bidirectional';
    if (relationshipData && relationshipData.relationshipDirection) {
      direction = relationshipData.relationshipDirection;
    }

    // Create the relationship edge with direction context and positions
    const newEdge = RelationshipEdgeService.createEdge(
      sourceId,
      targetId,
      relationshipType,
      sourceNode.data,
      targetNode.data,
      {
        direction,
        sourcePosition: sourceNode.position,
        targetPosition: targetNode.position
      }
    );

    return newEdge;
  }

  /**
   * Update person data and related edge labels
   */
  static updatePersonData(personId, newData, existingNodes, existingEdges = []) {
    const updatedNodes = existingNodes.map(node => 
      node.id === personId 
        ? { ...node, data: { ...node.data, ...newData } }
        : node
    );

    // If no edges provided, just return updated nodes
    if (!existingEdges || existingEdges.length === 0) {
      return { nodes: updatedNodes, edges: existingEdges };
    }

    // Find the updated person node
    const updatedPerson = updatedNodes.find(node => node.id === personId);
    if (!updatedPerson) {
      return { nodes: updatedNodes, edges: existingEdges };
    }

    // Update all edges connected to this person to refresh labels
    const updatedEdges = existingEdges.map(edge => {
      if (edge.source === personId || edge.target === personId) {
        const sourceNode = updatedNodes.find(n => n.id === edge.source);
        const targetNode = updatedNodes.find(n => n.id === edge.target);
        
        if (sourceNode && targetNode) {
          // Regenerate labels with updated person data
          const { sourceLabel, targetLabel } = RelationshipEdgeService.getDualLabels(
            edge.data.relationshipType,
            sourceNode.data,
            targetNode.data,
            edge.data.direction || 'bidirectional'
          );
          
          return {
            ...edge,
            data: {
              ...edge.data,
              sourceLabel,
              targetLabel,
              // Update legacy label for backwards compatibility
              label: sourceLabel || RelationshipEdgeService.getRelationshipLabel(
                edge.data.relationshipType, 
                sourceNode.data, 
                targetNode.data
              )
            }
          };
        }
      }
      return edge;
    });

    return { nodes: updatedNodes, edges: updatedEdges };
  }

  /**
   * Delete a person and all their relationships
   */
  static deletePerson(personId, existingNodes, existingEdges) {
    // Ensure we have valid arrays to work with
    const safeNodes = Array.isArray(existingNodes) ? existingNodes : [];
    const safeEdges = Array.isArray(existingEdges) ? existingEdges : [];
    
    const updatedNodes = safeNodes.filter(node => node.id !== personId);
    const updatedEdges = safeEdges.filter(edge => 
      edge.source !== personId && edge.target !== personId
    );

    return {
      nodes: updatedNodes,
      edges: updatedEdges
    };
  }

  /**
   * Auto-arrange family tree layout
   */
  static autoArrangeNodes(nodes, edges) {
    return PositionUtils.autoArrangeNodes(nodes, edges);
  }

  /**
   * Get family statistics
   */
  static getFamilyStatistics(nodes, edges) {
    // Ensure we have valid arrays to work with
    const safeNodes = Array.isArray(nodes) ? nodes : [];
    const safeEdges = Array.isArray(edges) ? edges : [];
    
    const generations = new Map();
    
    safeNodes.forEach(node => {
      const generation = PositionUtils.getPersonGeneration(node.id, safeNodes, safeEdges);
      if (!generations.has(generation)) {
        generations.set(generation, []);
      }
      generations.get(generation).push(node);
    });

    const relationships = new Map();
    safeEdges.forEach(edge => {
      const type = edge.data?.relationshipType || 'unknown';
      relationships.set(type, (relationships.get(type) || 0) + 1);
    });

    return {
      totalPeople: safeNodes.length,
      totalRelationships: safeEdges.length,
      generations: generations.size,
      generationBreakdown: Object.fromEntries(generations),
      relationshipBreakdown: Object.fromEntries(relationships)
    };
  }

  /**
   * Validate family tree structure
   */
  static validateFamilyTree(nodes, edges) {
    // Ensure we have valid arrays to work with
    const safeNodes = Array.isArray(nodes) ? nodes : [];
    const safeEdges = Array.isArray(edges) ? edges : [];
    
    const errors = [];
    const warnings = [];

    // Check for orphaned nodes
    const connectedNodeIds = new Set();
    safeEdges.forEach(edge => {
      if (edge && edge.source && edge.target) {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
      }
    });

    const orphanedNodes = safeNodes.filter(node => !connectedNodeIds.has(node.id));
    if (orphanedNodes.length > 1) {
      warnings.push(`${orphanedNodes.length} people are not connected to the family tree`);
    }

    // Check for circular relationships
    // (This is a simplified check - a full implementation would need more sophisticated cycle detection)
    const relationshipCounts = new Map();
    safeEdges.forEach(edge => {
      if (edge && edge.source && edge.target) {
        const key = `${edge.source}-${edge.target}`;
        const reverseKey = `${edge.target}-${edge.source}`;
        if (relationshipCounts.has(reverseKey)) {
          errors.push('Circular relationship detected');
        }
        relationshipCounts.set(key, (relationshipCounts.get(key) || 0) + 1);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
