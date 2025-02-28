import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

export default function Pricing() {
  return (
    <Container className="py-5">
      <h2 className="text-center mb-5">Pricing</h2>
      <Row>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Header>
              <h3 className="text-center">Free</h3>
            </Card.Header>
            <Card.Body>
              <h2 className="text-center mb-4">$0</h2>
              <ul className="list-unstyled">
                <li>✓ 1 document</li>
                <li>✓ Share with 1 user</li>
                <li>✓ Basic features</li>
              </ul>
              <Button variant="primary" className="w-100">Get Started</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Header>
              <h3 className="text-center">Basic</h3>
            </Card.Header>
            <Card.Body>
              <h2 className="text-center mb-4">$20/year</h2>
              <ul className="list-unstyled">
                <li>✓ Unlimited documents</li>
                <li>✓ Unlimited users</li>
                <li>✓ All features</li>
              </ul>
              <Button variant="primary" className="w-100">Choose Basic</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Header>
              <h3 className="text-center">Family</h3>
            </Card.Header>
            <Card.Body>
              <h2 className="text-center mb-4">$50/year</h2>
              <ul className="list-unstyled">
                <li>✓ Unlimited documents</li>
                <li>✓ Unlimited users</li>
                <li>✓ 5 email addresses</li>
              </ul>
              <Button variant="primary" className="w-100">Choose Family</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
