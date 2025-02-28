import React, { useState } from 'react';
import { Container, Card, Form, Alert } from 'react-bootstrap';
import PayGate from '../components/payment/PayGate';

const Payment = () => {
  const [amount, setAmount] = useState('100.00');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGetOrder = async () => {
    // In a real application, this would come from your backend
    return {
      id: 'ORDER-' + Math.random().toString(36).substr(2, 9),
      total_price: parseFloat(amount),
      currency: 'ZAR'
    };
  };

  const handlePaymentSuccess = () => {
    setSuccess('Payment completed successfully!');
    setError('');
  };

  return (
    <Container className="py-5">
      <Card style={{ maxWidth: '600px' }} className="mx-auto">
        <Card.Body>
          <h2 className="text-center mb-4">Make Payment</h2>

          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" onClose={() => setSuccess('')} dismissible>
              {success}
            </Alert>
          )}

          <Form className="mb-4">
            <Form.Group className="mb-3">
              <Form.Label>Amount (ZAR)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
              />
            </Form.Group>
          </Form>

          <PayGate
            onGetOrder={handleGetOrder}
            onPaid={handlePaymentSuccess}
          />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Payment;
