import React from 'react';
import PersonNode from './PersonNode';

const MaleNode = (props) => {
  return (
    <div className="person-node male">
      <PersonNode {...props} />
    </div>
  );
};

export default MaleNode;
