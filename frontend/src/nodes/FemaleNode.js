import React from 'react';
import PersonNode from './PersonNode';

const FemaleNode = (props) => {
  return (
    <div className="person-node female">
      <PersonNode {...props} />
    </div>
  );
};

export default FemaleNode;
