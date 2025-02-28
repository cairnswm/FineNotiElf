import React, { useState } from 'react';
import { Modal, Button, Form, ListGroup } from 'react-bootstrap';
import { useDocuments } from '../contexts/DocumentContext';

export default function ShareModal({ show, onHide, document }) {
  const { updateSharedWith } = useDocuments();
  const [newEmail, setNewEmail] = useState('');

  const handleAddEmail = (e) => {
    e.preventDefault();
    if (newEmail && !document.sharedWith.includes(newEmail)) {
      const updatedSharedWith = [...document.sharedWith, newEmail];
      updateSharedWith(document.id, updatedSharedWith);
      setNewEmail('');
    }
  };

  const handleRemoveEmail = (emailToRemove) => {
    const updatedSharedWith = document.sharedWith.filter(email => email !== emailToRemove);
    updateSharedWith(document.id, updatedSharedWith);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Share Document</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <strong>Owner:</strong> {document?.owner}
        </div>
        
        <Form onSubmit={handleAddEmail}>
          <Form.Group className="mb-3">
            <Form.Label>Add Email</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="email"
                placeholder="Enter email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <Button type="submit" size="sm" variant="primary">Add</Button>
            </div>
          </Form.Group>
        </Form>

        <div className="mt-4">
          <h6>Shared with:</h6>
          {document?.sharedWith.length === 0 ? (
            <p className="text-muted">No one yet</p>
          ) : (
            <ListGroup>
              {document?.sharedWith.map(email => (
                <ListGroup.Item 
                  key={email}
                  className="d-flex justify-content-between align-items-center"
                >
                  {email}
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleRemoveEmail(email)}
                  >
                    Remove
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}
