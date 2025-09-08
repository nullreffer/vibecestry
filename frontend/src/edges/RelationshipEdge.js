import React from 'react';
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

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {data?.label && (
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
    </>
  );
};

export default RelationshipEdge;
