import React from 'react';
import { Modal, Button, ListGroup, Badge } from 'react-bootstrap';
import { useInvites } from '../contexts/InviteContext';

export default function InvitesModal({ show, onHide }) {
  const { invites, acceptInvite, declineInvite } = useInvites();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Document Invites</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {invites.length === 0 ? (
          <p className="text-muted text-center py-4">No pending invites</p>
        ) : (
          <ListGroup>
            {invites.map((invite) => (
              <ListGroup.Item 
                key={invite.id}
                className="border rounded mb-2"
              >
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h5 className="mb-1">{invite.documentTitle}</h5>
                    <p className="text-muted mb-0">
                      From: {invite.from.name} ({invite.from.email})
                    </p>
                  </div>
                  <Badge bg="secondary">
                    {formatDate(invite.createdAt)}
                  </Badge>
                </div>
                <p className="mb-3">{invite.reason}</p>
                <div className="d-flex gap-2 justify-content-end">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => declineInvite(invite.id)}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => acceptInvite(invite.id)}
                  >
                    Accept
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
    </Modal>
  );
}
