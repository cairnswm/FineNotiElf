import React from 'react';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/home');
    } else {
      navigate('/login');
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center text-center">
        <Col md={8} lg={6}>
          <h1 className="display-4 mb-4">Welcome to Our Platform</h1>
          <p className="lead mb-4">
            Join our community today and experience the best features we have to offer.
          </p>
          <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleGetStarted}
              className="px-4 me-sm-3"
            >
              Get Started
            </Button>
            {!user && (
              <Button 
                variant="outline-secondary" 
                size="lg" 
                onClick={() => navigate('/register')}
                className="px-4"
              >
                Sign Up
              </Button>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LandingPage;
