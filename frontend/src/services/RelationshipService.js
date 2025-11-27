import { RELATIONSHIP_TYPES, getEdgeStyleForRelationship, RELATIONSHIP_LABELS, getDualLabels, mapLegacyRelationshipType } from '../constants/relationships';

/**
 * Business logic service for handling family tree relationships
 */
export class RelationshipService {
  
  /**
   * Generate relationship label based on source person's sex and relationship type
   */
  static getRelationshipLabel(relationshipType, sourcePersonData) {
    if (!sourcePersonData) return 'Unknown';
    
    // Map legacy relationship types
    const mappedType = mapLegacyRelationshipType(relationshipType);
    const isMale = sourcePersonData.biologicalSex === 'male';
    
    switch (mappedType) {
      case RELATIONSHIP_TYPES.BIOLOGICAL_PARENT_CHILD:
        return isMale ? 'Father' : 'Mother';
      case RELATIONSHIP_TYPES.ADOPTED_PARENT_CHILD:
        return isMale ? 'Adoptive Father' : 'Adoptive Mother';
      case RELATIONSHIP_TYPES.SPOUSE:
        return isMale ? 'Husband' : 'Wife';
      case RELATIONSHIP_TYPES.SIBLING:
        return isMale ? 'Brother' : 'Sister';
      default:
        return RELATIONSHIP_LABELS[mappedType] || 'Related';
    }
  }

  /**
   * Create a new edge with proper styling and labeling
   */
  static createRelationshipEdge(sourceId, targetId, relationshipType, sourcePersonData, targetPersonData) {
    const edgeId = `e${sourceId}-${targetId}`;
    
    // Map legacy relationship types
    const mappedType = mapLegacyRelationshipType(relationshipType);
    
    const style = getEdgeStyleForRelationship(mappedType);

    // Get dual labels based on the relationship type and person genders
    const { sourceLabel, targetLabel } = getDualLabels(
      mappedType, 
      sourcePersonData, 
      targetPersonData
    );

    return {
      id: edgeId,
      source: sourceId,
      target: targetId,
      type: 'relationship',
      data: { 
        sourceLabel,
        targetLabel,
        relationshipType: mappedType,
        // Keep legacy label for backwards compatibility
        label: sourceLabel || this.getRelationshipLabel(mappedType, sourcePersonData)
      },
      style: style
    };
  }

  /**
   * Get relationship options for UI dropdowns
   */
  static getRelationshipOptions() {
    return [
      { value: RELATIONSHIP_TYPES.BIOLOGICAL_PARENT_CHILD, label: RELATIONSHIP_LABELS[RELATIONSHIP_TYPES.BIOLOGICAL_PARENT_CHILD] },
      { value: RELATIONSHIP_TYPES.ADOPTED_PARENT_CHILD, label: RELATIONSHIP_LABELS[RELATIONSHIP_TYPES.ADOPTED_PARENT_CHILD] },
      { value: RELATIONSHIP_TYPES.SPOUSE, label: RELATIONSHIP_LABELS[RELATIONSHIP_TYPES.SPOUSE] }
    ];
  }

  /**
   * Validate if a relationship type is valid
   */
  static isValidRelationshipType(relationshipType) {
    return Object.values(RELATIONSHIP_TYPES).includes(relationshipType);
  }

  /**
   * Get suggested relationships based on current family structure
   */
  static getSuggestedRelationships(sourceNode, allNodes, allEdges) {
    // This could be enhanced with logic to suggest likely relationships
    // based on age differences, existing relationships, etc.
    return this.getRelationshipOptions();
  }

  /**
   * Check if two people can have a specific relationship type
   */
  static canHaveRelationship(person1, person2, relationshipType) {
    // Add business rules here, e.g.:
    // - Age validation for parent-child relationships
    // - Prevent circular relationships
    // - Check for conflicting relationships
    
    if (!person1 || !person2) return false;
    if (person1.id === person2.id) return false;
    
    // Map legacy relationship types
    const mappedType = mapLegacyRelationshipType(relationshipType);
    
    // Example: Basic age validation for parent-child relationships
    if (mappedType === RELATIONSHIP_TYPES.BIOLOGICAL_PARENT_CHILD || 
        mappedType === RELATIONSHIP_TYPES.ADOPTED_PARENT_CHILD) {
      const age1 = this.calculateAge(person1.data.birthDate);
      const age2 = this.calculateAge(person2.data.birthDate);
      
      // Parent should be older than child
      return Math.abs(age1 - age2) > 0; // Allow if there's an age difference
    }
    
    return true;
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
