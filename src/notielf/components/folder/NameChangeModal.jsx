import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useDocuments } from '../../contexts/DocumentContext';

const NameChangeModal = ({ show, handleClose, item }) => {
  const { updateDocumentName } = useDocuments();
  const [newName, setNewName] = useState(item.name);

  const handleSaveName = () => {
    updateDocumentName(item.id, newName);
    handleClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent the default form submission
      handleSaveName();
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Change Name</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formFolderName">
            <Form.Label>New Name</Form.Label>
            <Form.Control 
              type="text" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              onKeyDown={handleKeyDown} // Add the key down handler
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button size="sm" variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button size="sm" variant="primary" onClick={handleSaveName}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NameChangeModal;
