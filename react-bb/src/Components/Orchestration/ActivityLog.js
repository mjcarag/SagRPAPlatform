import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';

const ActivityLog = ({ logs }) => {
  return (
    <ListGroup>
      <ListGroup.Item active>Recent Activities</ListGroup.Item>
      {logs.map((log, index) => (
        <ListGroup.Item key={index}>
          {log.timestamp} - {log.message}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default ActivityLog;
