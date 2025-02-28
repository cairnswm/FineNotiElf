import React, { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle email submission here
    setShowModal(false);
  };

  return (
    <div className="bg-primary text-white py-5">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 order-2 order-lg-1">
            <h1 className="display-4 fw-bold">Share Your Lists with NotiElf</h1>
            <p className="lead">
              The easiest way to share shopping lists, gift ideas, and notes with your loved ones.
            </p>
            <div className="d-flex gap-3">
              <Button variant="light" size="lg" onClick={() => setShowModal(true)}>
                Join the Waiting List
              </Button>
              <Button variant="outline-light" size="lg" onClick={() => navigate('/home')}>
                Open App
              </Button>
            </div>
          </div>
          <div className="col-lg-6 order-1 order-lg-2 mb-4 mb-lg-0">

          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Join the Waiting List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
