import { RELATIONSHIP_TYPES, getEdgeStyleForRelationship, getDualLabels, mapLegacyRelationshipType } from '../constants/relationships';

/**
 * Enhanced service for creating and managing family tree relationships
 */
export class RelationshipEdgeService {
  
  /**
   * Create a relationship edge with proper styling and labeling
   */
  static createEdge(sourceId, targetId, relationshipType, sourcePersonData, targetPersonData, options = {}) {
    const edgeId = options.edgeId || `edge-${sourceId}-${targetId}`;
    
    // Map legacy relationship types to new combined types
    const mappedRelationshipType = mapLegacyRelationshipType(relationshipType);
    
    const style = getEdgeStyleForRelationship(mappedRelationshipType);
    const handles = this.determineHandles(mappedRelationshipType, options);

    // Get dual labels based on the relationship type and person genders
    const { sourceLabel, targetLabel } = getDualLabels(
      mappedRelationshipType, 
      sourcePersonData, 
      targetPersonData, 
      options.direction || 'bidirectional'
    );

    return {
      id: edgeId,
      source: sourceId,
      target: targetId,
      type: 'relationship',
      data: { 
        sourceLabel,
        targetLabel,
        relationshipType: mappedRelationshipType,
        // Keep legacy label for backwards compatibility
        label: sourceLabel || this.getRelationshipLabel(mappedRelationshipType, sourcePersonData, targetPersonData)
      },
      sourceHandle: handles.sourceHandle,
      targetHandle: handles.targetHandle,
      style: style
    };
  }

  /**
   * Create edge for parent-child relationship
   */
  static createParentChildEdge(parentId, childId, parentData, childData, relationshipType = RELATIONSHIP_TYPES.BIOLOGICAL_PARENT_CHILD) {
    // Map legacy relationship types
    const mappedType = mapLegacyRelationshipType(relationshipType);
    
    return this.createEdge(
      parentId, 
      childId, 
      mappedType, 
      parentData, 
      childData,
      {
        sourceHandle: 'bottom',
        targetHandle: 'top',
        direction: 'parent-to-child'
      }
    );
  }

  /**
   * Create edge for spouse relationship
   */
  static createSpouseEdge(person1Id, person2Id, person1Data, person2Data, person1Position, person2Position) {
    const sourceOnLeft = person1Position.x < person2Position.x;
    
    return this.createEdge(
      person1Id, 
      person2Id, 
      RELATIONSHIP_TYPES.SPOUSE, 
      person1Data, 
      person2Data,
      {
        sourceHandle: sourceOnLeft ? 'right' : 'left',
        targetHandle: sourceOnLeft ? 'left' : 'right'
      }
    );
  }

  /**
   * Create edge for sibling relationship
   */
  static createSiblingEdge(sibling1Id, sibling2Id, sibling1Data, sibling2Data) {
    return this.createEdge(
      sibling1Id, 
      sibling2Id, 
      RELATIONSHIP_TYPES.SIBLING, 
      sibling1Data, 
      sibling2Data,
      {
        sourceHandle: 'right',
        targetHandle: 'left'
      }
    );
  }

  /**
   * Determine appropriate handles based on relationship type
   */
  static determineHandles(relationshipType, options = {}) {
    if (options.sourceHandle && options.targetHandle) {
      return {
        sourceHandle: options.sourceHandle,
        targetHandle: options.targetHandle
      };
    }

    // Map legacy types first
    const mappedType = mapLegacyRelationshipType(relationshipType);

    switch (mappedType) {
      case RELATIONSHIP_TYPES.BIOLOGICAL_PARENT_CHILD:
      case RELATIONSHIP_TYPES.ADOPTED_PARENT_CHILD:
        return {
          sourceHandle: 'bottom',
          targetHandle: 'top'
        };
      
      case RELATIONSHIP_TYPES.SPOUSE:
        return {
          sourceHandle: 'right',
          targetHandle: 'left'
        };
      
      case RELATIONSHIP_TYPES.SIBLING:
        return {
          sourceHandle: 'right',
          targetHandle: 'left'
        };
      
      default:
        return {
          sourceHandle: 'bottom',
          targetHandle: 'top'
        };
    }
  }

  /**
   * Generate relationship label based on relationship type and person data
   */
  static getRelationshipLabel(relationshipType, sourcePersonData, targetPersonData) {
    if (!sourcePersonData) return 'Unknown';
    
    const isMale = sourcePersonData.biologicalSex === 'male';
    
    switch (relationshipType) {
      case RELATIONSHIP_TYPES.BIOLOGICAL_PARENT:
        return isMale ? 'Father' : 'Mother';
      case RELATIONSHIP_TYPES.ADOPTIVE_PARENT:
        return isMale ? 'Adoptive Father' : 'Adoptive Mother';
      case RELATIONSHIP_TYPES.STEPPARENT:
        return isMale ? 'Stepfather' : 'Stepmother';
      case RELATIONSHIP_TYPES.SPOUSE:
        return isMale ? 'Husband' : 'Wife';
      case RELATIONSHIP_TYPES.SIBLING:
        return isMale ? 'Brother' : 'Sister';
      case RELATIONSHIP_TYPES.HALF_SIBLING:
        return isMale ? 'Half-Brother' : 'Half-Sister';
      case RELATIONSHIP_TYPES.STEP_SIBLING:
        return isMale ? 'Step-Brother' : 'Step-Sister';
      case RELATIONSHIP_TYPES.CHILD:
        return isMale ? 'Son' : 'Daughter';
      case RELATIONSHIP_TYPES.GRANDPARENT:
        return isMale ? 'Grandfather' : 'Grandmother';
      case RELATIONSHIP_TYPES.GRANDCHILD:
        return isMale ? 'Grandson' : 'Granddaughter';
      case RELATIONSHIP_TYPES.UNCLE_AUNT:
        return isMale ? 'Uncle' : 'Aunt';
      case RELATIONSHIP_TYPES.NEPHEW_NIECE:
        return isMale ? 'Nephew' : 'Niece';
      case RELATIONSHIP_TYPES.COUSIN:
        return 'Cousin';
      default:
        return 'Related';
    }
  }

  /**
   * Create edge configuration for adding a new relative
   */
  static createNewRelativeEdge(sourceNodeId, newNodeId, relationshipType, sourceData, newPersonData, direction) {
    // Map legacy relationship types
    const mappedType = mapLegacyRelationshipType(relationshipType);
    
    switch (direction) {
      case 'parent':
        return this.createParentChildEdge(newNodeId, sourceNodeId, newPersonData, sourceData, mappedType);
      
      case 'child':
        return this.createParentChildEdge(sourceNodeId, newNodeId, sourceData, newPersonData, mappedType);
      
      case 'spouse':
        // For spouse, we need position data - this will be set later
        return this.createEdge(newNodeId, sourceNodeId, RELATIONSHIP_TYPES.SPOUSE, newPersonData, sourceData);
      
      default:
        return this.createEdge(newNodeId, sourceNodeId, mappedType, newPersonData, sourceData);
    }
  }

  /**
   * Validate relationship constraints
   */
  static validateRelationship(person1, person2, relationshipType, existingEdges) {
    const errors = [];
    
    // Map legacy relationship types
    const mappedType = mapLegacyRelationshipType(relationshipType);

    // Check if relationship already exists
    const existingRelationship = existingEdges.find(edge => 
      (edge.source === person1.id && edge.target === person2.id) ||
      (edge.source === person2.id && edge.target === person1.id)
    );

    if (existingRelationship) {
      errors.push('A relationship already exists between these people');
    }

    // Check for self-relationship
    if (person1.id === person2.id) {
      errors.push('Cannot create relationship with self');
    }

    // Age validation for parent-child relationships
    if (mappedType === RELATIONSHIP_TYPES.BIOLOGICAL_PARENT_CHILD || 
        mappedType === RELATIONSHIP_TYPES.ADOPTED_PARENT_CHILD) {
      const age1 = this.calculateAge(person1.data.birthDate);
      const age2 = this.calculateAge(person2.data.birthDate);
      
      if (age1 <= age2) {
        errors.push('Parent should be older than child');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate age from birth date
   */
  static calculateAge(birthDate) {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
}
