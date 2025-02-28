import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

export default function Features() {
  return (
    <div className="bg-secondary text-white py-5">
      <Container>
        <h2 className="text-center mb-5">Features</h2>
        <Row>
          <Col md={4} className="mb-4">
            <h3>Markdown Support</h3>
            <p>Write and format your notes using simple Markdown syntax</p>
          </Col>
          <Col md={4} className="mb-4">
            <h3>Easy Sharing</h3>
            <p>Share your lists with anyone instantly</p>
          </Col>
          <Col md={4} className="mb-4">
            <h3>Real-time Updates</h3>
            <p>See changes as they happen in real-time</p>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
