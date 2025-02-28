import React from 'react';
import { Form, Button } from 'react-bootstrap';

const ProfileForm = ({ 
  user,
  firstName,
  lastName,
  isEditing,
  onFirstNameChange,
  onLastNameChange,
  onSubmit,
  onEdit,
  onCancel 
}) => {
  return (
    <Form onSubmit={onSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          value={user?.email || ''}
          disabled
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>First Name</Form.Label>
        <Form.Control
          type="text"
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
          disabled={!isEditing}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Last Name</Form.Label>
        <Form.Control
          type="text"
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
          disabled={!isEditing}
          required
        />
      </Form.Group>

      {!isEditing ? (
        <Button 
          variant="primary" 
          onClick={onEdit}
          className="w-100"
        >
          Edit Profile
        </Button>
      ) : (
        <div className="d-grid gap-2">
          <Button 
            variant="primary" 
            type="submit"
          >
            Save Changes
          </Button>
          <Button 
            variant="secondary" 
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      )}
    </Form>
  );
};

export default ProfileForm;
