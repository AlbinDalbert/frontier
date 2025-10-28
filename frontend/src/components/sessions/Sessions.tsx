import React from 'react';
import './Sessions.css';

const Sessions: React.FC = () => {
  return (
    <div className="sessions">
      <h4>Chat History</h4>
      <ul>
        <li className="active">Session 1</li>
        <li>Session 2</li>
        <li>Session 3</li>
      </ul>
    </div>
  );
};

export default Sessions;