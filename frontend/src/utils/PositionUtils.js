/**
 * Utility functions for positioning family tree nodes
 */
export class PositionUtils {
  
  /**
   * Calculate position for new nodes based on relationship and existing layout
   */
  static calculateNewPosition(sourceNodeId, direction, existingNodes) {
    const sourceNode = existingNodes.find(n => n.id === sourceNodeId);
    if (!sourceNode) return { x: 200, y: 200 };

    const { x, y } = sourceNode.position;
    const offset = 250;

    switch (direction) {
      case 'parent':
        return { x: x + (Math.random() - 0.5) * 100, y: y - offset };
      case 'child':
        return { x: x + (Math.random() - 0.5) * 100, y: y + offset };
      case 'spouse':
        return { x: x + offset, y: y };
      case 'sibling':
        return { x: x + offset, y: y };
      default:
        return { x: x + offset, y: y + offset };
    }
  }

  /**
   * Get person's generation level based on their relationships
   */
  static getPersonGeneration(personId, nodes, edges) {
    // Start from the root generation (usually parents)
    let generation = 0;
    
    // Find parent relationships
    const parentEdges = edges.filter(edge => 
      edge.target === personId && 
      (edge.data.relationshipType === 'biological-parent-child' || 
       edge.data.relationshipType === 'adopted-parent-child')
    );
    
    if (parentEdges.length > 0) {
      // If has parents, person is one generation down
      const parentGenerations = parentEdges.map(edge => 
        this.getPersonGeneration(edge.source, nodes, edges)
      );
      generation = Math.max(...parentGenerations) + 1;
    }
    
    return generation;
  }

  /**
   * Get optimal position for a person based on their generation
   */
  static getPositionForGeneration(generation, siblings = []) {
    const baseY = 100 + (generation * 200);
    const baseX = 300 + (siblings.length * 250);
    
    return { x: baseX, y: baseY };
  }

  /**
   * Auto-arrange family tree layout
   */
  static autoArrangeNodes(nodes, edges) {
    const arrangedNodes = [...nodes];
    const generations = new Map();
    
    // Group people by generation
    arrangedNodes.forEach(node => {
      const generation = this.getPersonGeneration(node.id, nodes, edges);
      if (!generations.has(generation)) {
        generations.set(generation, []);
      }
      generations.get(generation).push(node);
    });
    
    // Position each generation
    generations.forEach((generationNodes, generation) => {
      generationNodes.forEach((node, index) => {
        const position = this.getPositionForGeneration(generation, 
          generationNodes.slice(0, index));
        node.position = position;
      });
    });
    
    return arrangedNodes;
  }

  /**
   * Find optimal position to avoid node overlap
   */
  static findNonOverlappingPosition(proposedPosition, existingNodes, nodeWidth = 200, nodeHeight = 100) {
    let { x, y } = proposedPosition;
    let attempts = 0;
    const maxAttempts = 50;
    
    while (attempts < maxAttempts) {
      const overlapping = existingNodes.some(node => {
        const distance = Math.sqrt(
          Math.pow(node.position.x - x, 2) + 
          Math.pow(node.position.y - y, 2)
        );
        return distance < Math.max(nodeWidth, nodeHeight);
      });
      
      if (!overlapping) {
        return { x, y };
      }
      
      // Try a new position in a spiral pattern
      const angle = (attempts * 0.5) % (2 * Math.PI);
      const radius = 50 + (attempts * 10);
      x = proposedPosition.x + Math.cos(angle) * radius;
      y = proposedPosition.y + Math.sin(angle) * radius;
      
      attempts++;
    }
    
    return proposedPosition; // Return original if no good position found
  }
}
