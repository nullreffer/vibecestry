// Relationship types and their configurations
export const RELATIONSHIP_TYPES = {
  BIOLOGICAL_PARENT_CHILD: 'biological-parent-child',
  ADOPTED_PARENT_CHILD: 'adopted-parent-child',
  SPOUSE: 'spouse',
  SIBLING: 'sibling',
  MARRIAGE: 'marriage'
};

export const RELATIONSHIP_LABELS = {
  [RELATIONSHIP_TYPES.BIOLOGICAL_PARENT_CHILD]: 'Biological Parent-Child',
  [RELATIONSHIP_TYPES.ADOPTED_PARENT_CHILD]: 'Adopted Parent-Child',
  [RELATIONSHIP_TYPES.SPOUSE]: 'Spouse',
  [RELATIONSHIP_TYPES.SIBLING]: 'Sibling',
  [RELATIONSHIP_TYPES.MARRIAGE]: 'Marriage'
};

export const EDGE_STYLES = {
  [RELATIONSHIP_TYPES.BIOLOGICAL_PARENT_CHILD]: { 
    stroke: '#6ede87', 
    strokeWidth: 2, 
    strokeDasharray: 'none' 
  },
  [RELATIONSHIP_TYPES.ADOPTED_PARENT_CHILD]: { 
    stroke: '#ffa500', 
    strokeWidth: 2, 
    strokeDasharray: '5,5' 
  },
  [RELATIONSHIP_TYPES.SPOUSE]: { 
    stroke: '#ff69b4', 
    strokeWidth: 2, 
    strokeDasharray: '3,3' 
  },
  [RELATIONSHIP_TYPES.SIBLING]: { 
    stroke: '#87ceeb', 
    strokeWidth: 2, 
    strokeDasharray: '2,2' 
  },
  [RELATIONSHIP_TYPES.MARRIAGE]: { 
    stroke: '#e53e3e', 
    strokeWidth: 3, 
    strokeDasharray: 'none' 
  }
};

// Dual label system - labels for each end of the relationship
export const DUAL_LABELS = {
  [RELATIONSHIP_TYPES.BIOLOGICAL_PARENT_CHILD]: {
    // Labels from parent perspective
    parent: {
      male: { to_male: 'Father', to_female: 'Father' },
      female: { to_male: 'Mother', to_female: 'Mother' }
    },
    // Labels from child perspective  
    child: {
      male: { from_male: 'Son', from_female: 'Son' },
      female: { from_male: 'Daughter', from_female: 'Daughter' }
    }
  },
  [RELATIONSHIP_TYPES.ADOPTED_PARENT_CHILD]: {
    // Labels from parent perspective
    parent: {
      male: { to_male: 'Adoptive Father', to_female: 'Adoptive Father' },
      female: { to_male: 'Adoptive Mother', to_female: 'Adoptive Mother' }
    },
    // Labels from child perspective
    child: {
      male: { from_male: 'Adopted Son', from_female: 'Adopted Son' },
      female: { from_male: 'Adopted Daughter', from_female: 'Adopted Daughter' }
    }
  },
  [RELATIONSHIP_TYPES.SPOUSE]: {
    spouse: {
      male: { to_male: 'Husband', to_female: 'Husband' },
      female: { to_male: 'Wife', to_female: 'Wife' }
    }
  },
  [RELATIONSHIP_TYPES.SIBLING]: {
    sibling: {
      male: { to_male: 'Brother', to_female: 'Brother' },
      female: { to_male: 'Sister', to_female: 'Sister' }
    }
  }
};

// Get relationship options for dropdowns (removed sibling - use marriage nodes instead)
export const getRelationshipOptions = () => {
  return [
    { value: RELATIONSHIP_TYPES.BIOLOGICAL_PARENT_CHILD, label: RELATIONSHIP_LABELS[RELATIONSHIP_TYPES.BIOLOGICAL_PARENT_CHILD] },
    { value: RELATIONSHIP_TYPES.ADOPTED_PARENT_CHILD, label: RELATIONSHIP_LABELS[RELATIONSHIP_TYPES.ADOPTED_PARENT_CHILD] },
    { value: RELATIONSHIP_TYPES.SPOUSE, label: RELATIONSHIP_LABELS[RELATIONSHIP_TYPES.SPOUSE] }
  ];
};

// Get simplified relationship options for Add Relative dialog (no siblings - use marriage nodes)
export const getSimplifiedRelationshipOptions = () => {
  return [
    { value: 'biological-parent', label: 'Parent (Biological)', relationshipType: RELATIONSHIP_TYPES.BIOLOGICAL_PARENT_CHILD },
    { value: 'biological-child', label: 'Child (Biological)', relationshipType: RELATIONSHIP_TYPES.BIOLOGICAL_PARENT_CHILD },
    { value: 'adopted-parent', label: 'Parent (Adopted)', relationshipType: RELATIONSHIP_TYPES.ADOPTED_PARENT_CHILD },
    { value: 'adopted-child', label: 'Child (Adopted)', relationshipType: RELATIONSHIP_TYPES.ADOPTED_PARENT_CHILD },
    { value: 'spouse', label: 'Spouse', relationshipType: RELATIONSHIP_TYPES.SPOUSE }
  ];
};

// Get edge style for a relationship type
export const getEdgeStyleForRelationship = (relationshipType) => {
  return EDGE_STYLES[relationshipType] || { stroke: '#999', strokeWidth: 2, strokeDasharray: 'none' };
};

// Check if relationship is biological
export const isBiologicalRelationship = (relationshipType) => {
  return relationshipType === RELATIONSHIP_TYPES.BIOLOGICAL_PARENT_CHILD;
};

// Check if relationship is adopted
export const isAdoptedRelationship = (relationshipType) => {
  return relationshipType === RELATIONSHIP_TYPES.ADOPTED_PARENT_CHILD;
};

// Get dual labels for a relationship based on source and target person's gender
export const getDualLabels = (relationshipType, sourcePerson, targetPerson, direction = 'bidirectional') => {
  const labels = DUAL_LABELS[relationshipType];
  if (!labels) return { sourceLabel: '', targetLabel: '' };

  const sourceGender = sourcePerson.biologicalSex || 'male';
  const targetGender = targetPerson.biologicalSex || 'male';

  let sourceLabel = '';
  let targetLabel = '';

  switch (relationshipType) {
    case RELATIONSHIP_TYPES.BIOLOGICAL_PARENT_CHILD:
    case RELATIONSHIP_TYPES.ADOPTED_PARENT_CHILD:
      // Determine who is parent and who is child based on context or age
      // For now, assume source is parent if direction is 'parent-to-child'
      if (direction === 'parent-to-child') {
        sourceLabel = labels.parent[sourceGender][`to_${targetGender}`];
        targetLabel = labels.child[targetGender][`from_${sourceGender}`];
      } else if (direction === 'child-to-parent') {
        sourceLabel = labels.child[sourceGender][`from_${targetGender}`];
        targetLabel = labels.parent[targetGender][`to_${sourceGender}`];
      } else {
        // Default bidirectional - try to determine from age or birthDate
        const sourceAge = getPersonAge(sourcePerson);
        const targetAge = getPersonAge(targetPerson);
        
        if (sourceAge > targetAge) {
          // Source is likely parent
          sourceLabel = labels.parent[sourceGender][`to_${targetGender}`];
          targetLabel = labels.child[targetGender][`from_${sourceGender}`];
        } else {
          // Target is likely parent
          sourceLabel = labels.child[sourceGender][`from_${targetGender}`];
          targetLabel = labels.parent[targetGender][`to_${sourceGender}`];
        }
      }
      break;

    case RELATIONSHIP_TYPES.SPOUSE:
      sourceLabel = labels.spouse[sourceGender][`to_${targetGender}`];
      targetLabel = labels.spouse[targetGender][`to_${sourceGender}`];
      break;

    case RELATIONSHIP_TYPES.SIBLING:
      sourceLabel = labels.sibling[sourceGender][`to_${targetGender}`];
      targetLabel = labels.sibling[targetGender][`to_${sourceGender}`];
      break;

    default:
      sourceLabel = RELATIONSHIP_LABELS[relationshipType] || '';
      targetLabel = RELATIONSHIP_LABELS[relationshipType] || '';
  }

  return { sourceLabel, targetLabel };
};

// Helper function to calculate person's age
const getPersonAge = (person) => {
  if (!person.birthDate) return 0;
  
  const birthYear = new Date(person.birthDate).getFullYear();
  const currentYear = new Date().getFullYear();
  
  return currentYear - birthYear;
};

// Legacy support - map old relationship types to new ones
export const mapLegacyRelationshipType = (oldType) => {
  const legacyMapping = {
    'biological-parent': RELATIONSHIP_TYPES.BIOLOGICAL_PARENT_CHILD,
    'biological-child': RELATIONSHIP_TYPES.BIOLOGICAL_PARENT_CHILD,
    'adopted-parent': RELATIONSHIP_TYPES.ADOPTED_PARENT_CHILD,
    'adopted-child': RELATIONSHIP_TYPES.ADOPTED_PARENT_CHILD,
    'spouse': RELATIONSHIP_TYPES.SPOUSE,
    'sibling': RELATIONSHIP_TYPES.SIBLING
  };
  
  return legacyMapping[oldType] || oldType;
};
