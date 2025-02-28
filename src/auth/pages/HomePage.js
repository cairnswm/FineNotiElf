import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1>Welcome, {user?.name || 'User'}!</h1>
          <p className="lead">This is your personalized dashboard.</p>
        </Col>
      </Row>
      
      <Row className="g-4">
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Profile Overview</Card.Title>
              <Card.Text>
                Email: {user?.email}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Quick Actions</Card.Title>
              <Card.Text>
                Access your most frequently used features here.
              </Card.Text>
              <Button 
                variant="primary" 
                onClick={() => navigate('/payment')}
              >
                Make Payment
              </Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Recent Activity</Card.Title>
              <Card.Text>
                View your recent activities and updates.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
