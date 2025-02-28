import React from 'react';
import { Button, Badge } from 'react-bootstrap';

export default function EditingControls({ 
  isReadOnly, 
  onRequestEdit, 
  onFinishEdit 
}) {
  return (
    <div className="d-flex align-items-center gap-2 pt-2">
      {isReadOnly ? (
        <>
          <Badge bg="secondary">Read Only</Badge>
          <Button
            size="sm"
            variant="outline-primary"
            onClick={onRequestEdit}
          >
            Request Editing
          </Button>
        </>
      ) : (
        <>
          <Badge bg="success">Editing</Badge>
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={onFinishEdit}
          >
            Done
          </Button>
        </>
      )}
    </div>
  );
}
