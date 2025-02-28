import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useInvites } from '../contexts/InviteContext';
import { useAuth } from '../../auth/hooks/useAuth';

export default function ShareModal({ show, onHide, document }) {
  const { createInvite } = useInvites();
  const { user } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!newEmail) {
      setError('Please enter an email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createInvite({
        to_email: newEmail,
        document_id: document.id,
        from_name: user.name || user.email,
        from_email: user.email,
        reason: reason || 'You have been invited to collaborate on this document'
      });
      
      setSuccess(`Invite sent to ${newEmail}`);
      setNewEmail('');
      setReason('');
    } catch (err) {
      setError('Failed to send invite. Please try again.');
      console.error('Error sending invite:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Share Document: {document?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <h5 className="text-primary">{document?.name}</h5>
        </div>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSendInvite}>
          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Reason for Sharing</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter a message for the recipient"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Form.Group>
          
          <Button 
            type="submit" 
            variant="primary" 
            className="w-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Invite'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
