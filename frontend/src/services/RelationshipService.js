import { RELATIONSHIP_TYPES, getEdgeStyleForRelationship, RELATIONSHIP_LABELS } from '../constants/relationships';

/**
 * Business logic service for handling family tree relationships
 */
export class RelationshipService {
  
  /**
   * Generate relationship label based on source person's sex and relationship type
   */
  static getRelationshipLabel(relationshipType, sourcePersonData) {
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
        return RELATIONSHIP_LABELS[relationshipType] || 'Unknown';
    }
  }

  /**
   * Create a new edge with proper styling and labeling
   */
  static createRelationshipEdge(sourceId, targetId, relationshipType, sourcePersonData) {
    const edgeId = `e${sourceId}-${targetId}`;
    const label = this.getRelationshipLabel(relationshipType, sourcePersonData);
    const style = getEdgeStyleForRelationship(relationshipType);

    return {
      id: edgeId,
      source: sourceId,
      target: targetId,
      type: 'relationship',
      data: { 
        label, 
        relationshipType 
      },
      ...style
    };
  }

  /**
   * Get relationship options for UI dropdowns
   */
  static getRelationshipOptions() {
    return [
      { value: RELATIONSHIP_TYPES.BIOLOGICAL_PARENT, label: 'Biological Parent' },
      { value: RELATIONSHIP_TYPES.ADOPTIVE_PARENT, label: 'Adoptive Parent' },
      { value: RELATIONSHIP_TYPES.STEPPARENT, label: 'Step Parent' },
      { value: RELATIONSHIP_TYPES.SPOUSE, label: 'Spouse' },
      { value: RELATIONSHIP_TYPES.SIBLING, label: 'Sibling' },
      { value: RELATIONSHIP_TYPES.HALF_SIBLING, label: 'Half Sibling' },
      { value: RELATIONSHIP_TYPES.STEP_SIBLING, label: 'Step Sibling' },
      { value: RELATIONSHIP_TYPES.CHILD, label: 'Child' },
      { value: RELATIONSHIP_TYPES.GRANDPARENT, label: 'Grandparent' },
      { value: RELATIONSHIP_TYPES.GRANDCHILD, label: 'Grandchild' },
      { value: RELATIONSHIP_TYPES.UNCLE_AUNT, label: 'Uncle/Aunt' },
      { value: RELATIONSHIP_TYPES.NEPHEW_NIECE, label: 'Nephew/Niece' },
      { value: RELATIONSHIP_TYPES.COUSIN, label: 'Cousin' },
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
    
    // Example: Basic age validation for parent-child relationships
    if (relationshipType === RELATIONSHIP_TYPES.BIOLOGICAL_PARENT) {
      const age1 = this.calculateAge(person1.data.birthDate);
      const age2 = this.calculateAge(person2.data.birthDate);
      
      // Parent should be older than child
      return age1 > age2;
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
