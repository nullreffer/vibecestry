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
        newGeneration = parentGeneration;
        relationshipType = RELATIONSHIP_TYPES.SIBLING;
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
    const parentNode = existingNodes.find(node => node.id === parentNodeId);
    if (!parentNode) return null;

    const newId = `${Date.now()}`;
    const parentGeneration = PositionUtils.getPersonGeneration(parentNodeId, existingNodes, existingEdges);
    
    let newGeneration;
    let direction;
    
    // Map relationship type to direction and generation
    switch (relativeData.relationshipType) {
      case RELATIONSHIP_TYPES.BIOLOGICAL_PARENT:
      case RELATIONSHIP_TYPES.ADOPTIVE_PARENT:
      case RELATIONSHIP_TYPES.STEPPARENT:
        direction = 'parent';
        newGeneration = parentGeneration + 1;
        break;
      case RELATIONSHIP_TYPES.CHILD:
        direction = 'child';
        newGeneration = parentGeneration - 1;
        break;
      case RELATIONSHIP_TYPES.SPOUSE:
        direction = 'spouse';
        newGeneration = parentGeneration;
        break;
      default:
        direction = 'sibling';
        newGeneration = parentGeneration;
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
  static createLink(sourceId, targetId, relationshipType, existingNodes) {
    const sourceNode = existingNodes.find(n => n.id === sourceId);
    const targetNode = existingNodes.find(n => n.id === targetId);
    
    if (!sourceNode || !targetNode) return null;

    // Create the relationship edge
    const newEdge = RelationshipEdgeService.createEdge(
      sourceId,
      targetId,
      relationshipType,
      sourceNode.data,
      targetNode.data,
      {
        // Handle positions will be determined by the relationship type
      }
    );

    return newEdge;
  }

  /**
   * Update person data
   */
  static updatePersonData(personId, newData, existingNodes) {
    return existingNodes.map(node => 
      node.id === personId 
        ? { ...node, data: { ...node.data, ...newData } }
        : node
    );
  }

  /**
   * Delete a person and all their relationships
   */
  static deletePerson(personId, existingNodes, existingEdges) {
    const updatedNodes = existingNodes.filter(node => node.id !== personId);
    const updatedEdges = existingEdges.filter(edge => 
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
    const generations = new Map();
    
    nodes.forEach(node => {
      const generation = PositionUtils.getPersonGeneration(node.id, nodes, edges);
      if (!generations.has(generation)) {
        generations.set(generation, []);
      }
      generations.get(generation).push(node);
    });

    const relationships = new Map();
    edges.forEach(edge => {
      const type = edge.data.relationshipType;
      relationships.set(type, (relationships.get(type) || 0) + 1);
    });

    return {
      totalPeople: nodes.length,
      totalRelationships: edges.length,
      generations: generations.size,
      generationBreakdown: Object.fromEntries(generations),
      relationshipBreakdown: Object.fromEntries(relationships)
    };
  }

  /**
   * Validate family tree structure
   */
  static validateFamilyTree(nodes, edges) {
    const errors = [];
    const warnings = [];

    // Check for orphaned nodes
    const connectedNodeIds = new Set();
    edges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    const orphanedNodes = nodes.filter(node => !connectedNodeIds.has(node.id));
    if (orphanedNodes.length > 1) {
      warnings.push(`${orphanedNodes.length} people are not connected to the family tree`);
    }

    // Check for circular relationships
    // (This is a simplified check - a full implementation would need more sophisticated cycle detection)
    const relationshipCounts = new Map();
    edges.forEach(edge => {
      const key = `${edge.source}-${edge.target}`;
      const reverseKey = `${edge.target}-${edge.source}`;
      if (relationshipCounts.has(reverseKey)) {
        errors.push('Circular relationship detected');
      }
      relationshipCounts.set(key, true);
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
