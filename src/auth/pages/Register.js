import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      console.log('Attempting registration with:', { email });
      const result = await register(email, password, confirmPassword);
      console.log('Registration response:', result);

      if (result?.errors) {
        console.log('Error type:', typeof result.errors);
        console.log('Error value:', result.errors);

        if (Array.isArray(result.errors)) {
          // Extract message from error object in array
          const errorMessages = result.errors
            .map(err => err.message)
            .filter(Boolean)
            .join(', ');
          setError(errorMessages || 'Registration failed');
        } else if (typeof result.errors === 'string') {
          setError(result.errors);
        } else {
          setError('Registration failed. Please try again.');
        }
      } else if (!result?.token) {
        setError('Registration failed. Please try again.');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred during registration. Please try again.');
    }
  };

  return (
    <Container className="mt-5">
      <Card style={{ maxWidth: '400px' }} className="mx-auto">
        <Card.Body>
          <h2 className="text-center mb-4">Register</h2>

          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Register
            </Button>
          </Form>

          <div className="text-center mt-3">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;
