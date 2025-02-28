import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const SettingsModal = ({ 
  show, 
  onHide, 
  settingsForm, 
  setSettingsForm, 
  saveSettings,
  listSettings
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>List Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>ID</Form.Label>
            <Form.Control
              type="text"
              value={listSettings?.id || ''}
              disabled
            />
            <Form.Text className="text-muted">
              ID cannot be edited
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Check 
              type="checkbox"
              id="hasDueDates"
              label="Enable Due Dates"
              checked={settingsForm.hasDueDates}
              onChange={(e) => setSettingsForm({...settingsForm, hasDueDates: e.target.checked})}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Check 
              type="checkbox"
              id="canDelete"
              label="Allow Item Deletion"
              checked={settingsForm.canDelete}
              onChange={(e) => setSettingsForm({...settingsForm, canDelete: e.target.checked})}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={saveSettings}
        >
          Save Settings
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SettingsModal;
