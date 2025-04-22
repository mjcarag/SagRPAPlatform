import React from 'react';
import Card from 'react-bootstrap/Card';

const BotPerformance = ({ performance }) => {
  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>Bot Performance</Card.Title>
        <p>Success Rate: {performance.successRate}%</p>
        <p>Avg. Execution Time: {performance.avgExecutionTime}s</p>
        <p>Tasks Completed: {performance.tasksCompleted}</p>
      </Card.Body>
    </Card>
  );
};

export default BotPerformance;
