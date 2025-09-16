// Relationship types and their configurations
export const RELATIONSHIP_TYPES = {
  BIOLOGICAL_PARENT: 'biological-parent',
  BIOLOGICAL_CHILD: 'biological-child',
  ADOPTED_PARENT: 'adopted-parent',
  ADOPTED_CHILD: 'adopted-child',
  SPOUSE: 'spouse',
  SIBLING: 'sibling'
};

export const RELATIONSHIP_LABELS = {
  [RELATIONSHIP_TYPES.BIOLOGICAL_PARENT]: 'Biological Parent',
  [RELATIONSHIP_TYPES.BIOLOGICAL_CHILD]: 'Biological Child',
  [RELATIONSHIP_TYPES.ADOPTED_PARENT]: 'Adopted Parent',
  [RELATIONSHIP_TYPES.ADOPTED_CHILD]: 'Adopted Child',
  [RELATIONSHIP_TYPES.SPOUSE]: 'Spouse',
  [RELATIONSHIP_TYPES.SIBLING]: 'Sibling'
};

export const EDGE_STYLES = {
  [RELATIONSHIP_TYPES.BIOLOGICAL_PARENT]: { 
    stroke: '#6ede87', 
    strokeWidth: 2, 
    strokeDasharray: 'none' 
  },
  [RELATIONSHIP_TYPES.BIOLOGICAL_CHILD]: { 
    stroke: '#6ede87', 
    strokeWidth: 2, 
    strokeDasharray: 'none' 
  },
  [RELATIONSHIP_TYPES.ADOPTED_PARENT]: { 
    stroke: '#ffa500', 
    strokeWidth: 2, 
    strokeDasharray: '5,5' 
  },
  [RELATIONSHIP_TYPES.ADOPTED_CHILD]: { 
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
  }
};

// Get relationship options for dropdowns
export const getRelationshipOptions = () => {
  return [
    { value: RELATIONSHIP_TYPES.BIOLOGICAL_PARENT, label: RELATIONSHIP_LABELS[RELATIONSHIP_TYPES.BIOLOGICAL_PARENT] },
    { value: RELATIONSHIP_TYPES.BIOLOGICAL_CHILD, label: RELATIONSHIP_LABELS[RELATIONSHIP_TYPES.BIOLOGICAL_CHILD] },
    { value: RELATIONSHIP_TYPES.ADOPTED_PARENT, label: RELATIONSHIP_LABELS[RELATIONSHIP_TYPES.ADOPTED_PARENT] },
    { value: RELATIONSHIP_TYPES.ADOPTED_CHILD, label: RELATIONSHIP_LABELS[RELATIONSHIP_TYPES.ADOPTED_CHILD] },
    { value: RELATIONSHIP_TYPES.SPOUSE, label: RELATIONSHIP_LABELS[RELATIONSHIP_TYPES.SPOUSE] },
    { value: RELATIONSHIP_TYPES.SIBLING, label: RELATIONSHIP_LABELS[RELATIONSHIP_TYPES.SIBLING] }
  ];
};

// Get edge style for a relationship type
export const getEdgeStyleForRelationship = (relationshipType) => {
  return EDGE_STYLES[relationshipType] || { stroke: '#999', strokeWidth: 2, strokeDasharray: 'none' };
};

// Check if relationship is biological
export const isBiologicalRelationship = (relationshipType) => {
  return relationshipType === RELATIONSHIP_TYPES.BIOLOGICAL_PARENT || 
         relationshipType === RELATIONSHIP_TYPES.BIOLOGICAL_CHILD;
};

// Check if relationship is adopted
export const isAdoptedRelationship = (relationshipType) => {
  return relationshipType === RELATIONSHIP_TYPES.ADOPTED_PARENT || 
         relationshipType === RELATIONSHIP_TYPES.ADOPTED_CHILD;
};
