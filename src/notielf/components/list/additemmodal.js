import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const AddItemModal = ({ 
  show, 
  onHide, 
  newItemName, 
  setNewItemName, 
  newItemDescription, 
  setNewItemDescription, 
  newItemDueDate, 
  setNewItemDueDate, 
  addItem, 
  hasDueDates 
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Item Name</Form.Label>
            <Form.Control
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Enter item name"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              placeholder="Enter description (optional)"
            />
          </Form.Group>
          
          {hasDueDates && (
            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                value={newItemDueDate}
                onChange={(e) => setNewItemDueDate(e.target.value)}
              />
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={addItem}
          disabled={!newItemName.trim()}
        >
          Add Item
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddItemModal;
