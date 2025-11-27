import React, { useState, useEffect } from 'react';
import { getSmoothStepPath, getEdgeCenter } from 'react-flow-renderer';
import './RelationshipEdge.css';

const RelationshipEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => {
      setShowContextMenu(false);
    };

    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showContextMenu]);

  const handleEdgeClick = (event) => {
    event.stopPropagation();
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setShowContextMenu(true);
  };

  const handleDeleteEdge = () => {
    if (data?.onDelete) {
      data.onDelete(id);
    }
    setShowContextMenu(false);
  };

  const handleCloseMenu = () => {
    setShowContextMenu(false);
  };
  const edgePath = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [edgeCenterX, edgeCenterY] = getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  // Calculate positions for dual labels
  const sourceOffsetX = sourceX + (edgeCenterX - sourceX) * 0.2;
  const sourceOffsetY = sourceY + (edgeCenterY - sourceY) * 0.2;
  const targetOffsetX = targetX + (edgeCenterX - targetX) * 0.2;
  const targetOffsetY = targetY + (edgeCenterY - targetY) * 0.2;

  // Support both single label (legacy) and dual labels (new)
  const hasDualLabels = data?.sourceLabel && data?.targetLabel;
  const hasLegacyLabel = data?.label && !hasDualLabels;

  return (
    <>
      {/* Clickable path */}
      <path
        id={id}
        style={{ ...style, cursor: 'pointer' }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        onClick={handleEdgeClick}
      />
      
      {/* Invisible wider path for easier clicking */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth="10"
        onClick={handleEdgeClick}
        style={{ cursor: 'pointer' }}
      />
      
      {/* Legacy single label support */}
      {hasLegacyLabel && (
        <g>
          <rect
            x={edgeCenterX - (data.label.length * 4)}
            y={edgeCenterY - 10}
            width={data.label.length * 8}
            height={20}
            fill="#2d2d2d"
            stroke="#404040"
            strokeWidth="1"
            rx="4"
            className="relationship-label-bg"
          />
          <text
            x={edgeCenterX}
            y={edgeCenterY + 4}
            textAnchor="middle"
            fontSize="12"
            fill="#ffffff"
            className="relationship-label-text"
          >
            {data.label}
          </text>
        </g>
      )}

      {/* Dual labels - source side */}
      {hasDualLabels && data.sourceLabel && (
        <g>
          <rect
            x={sourceOffsetX - (data.sourceLabel.length * 3.5)}
            y={sourceOffsetY - 8}
            width={data.sourceLabel.length * 7}
            height={16}
            fill="#2d2d2d"
            stroke="#404040"
            strokeWidth="1"
            rx="3"
            className="relationship-label-bg source-label"
          />
          <text
            x={sourceOffsetX}
            y={sourceOffsetY + 3}
            textAnchor="middle"
            fontSize="10"
            fill="#ffffff"
            className="relationship-label-text source-label-text"
          >
            {data.sourceLabel}
          </text>
        </g>
      )}

      {/* Dual labels - target side */}
      {hasDualLabels && data.targetLabel && (
        <g>
          <rect
            x={targetOffsetX - (data.targetLabel.length * 3.5)}
            y={targetOffsetY - 8}
            width={data.targetLabel.length * 7}
            height={16}
            fill="#2d2d2d"
            stroke="#404040"
            strokeWidth="1"
            rx="3"
            className="relationship-label-bg target-label"
          />
          <text
            x={targetOffsetX}
            y={targetOffsetY + 3}
            textAnchor="middle"
            fontSize="10"
            fill="#ffffff"
            className="relationship-label-text target-label-text"
          >
            {data.targetLabel}
          </text>
        </g>
      )}

      {/* Context Menu */}
      {showContextMenu && (
        <foreignObject
          x={contextMenuPosition.x - sourceX}
          y={contextMenuPosition.y - sourceY}
          width="150"
          height="80"
          className="edge-context-menu"
        >
          <div className="edge-context-menu-content">
            <button 
              className="delete-edge-btn"
              onClick={handleDeleteEdge}
              title="Delete relationship"
            >
              🗑️ Delete Relationship
            </button>
            <button 
              className="cancel-edge-btn"
              onClick={handleCloseMenu}
              title="Cancel"
            >
              ❌ Cancel
            </button>
          </div>
        </foreignObject>
      )}
    </>
  );
};

export default RelationshipEdge;
