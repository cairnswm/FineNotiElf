import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";

import useAuth from "../../auth/context/useauth";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { forgot } = useAuth();
  const [email, setEmail] = useState("");
  
  const handleForgotPassword = (e) => {
    e.preventDefault();
    forgot(email).then(() => {
      navigate("/");
    }); 
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Modal show={true} onHide={() => navigate("/")}>
        <Modal.Header closeButton>
          <Modal.Title>Forgot Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleForgotPassword}>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" placeholder="Enter email" required value={email} onChnage={e=>setEmail(e.target.value)} />
            </Form.Group>
            <Button variant="primary" type="submit">
              Send Reset Link
            </Button>
          </Form>
        </Modal.Body>

        <Modal.Footer className="text-center mt-4">
          <div>
            Remembered your password? <Link to="/login">Login</Link>
          </div>
          <div>
            Don't have an account? <Link to="/register">Register</Link>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ForgotPasswordPage;
