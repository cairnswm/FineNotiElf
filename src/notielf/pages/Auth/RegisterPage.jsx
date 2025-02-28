import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Button, Form, Alert } from "react-bootstrap";

import useAuth from "../../auth/context/useauth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  
  const handleRegister = (e) => {
    e.preventDefault();
    e.preventDefault();
    register(email, password, confirmPassword).then((result) => {
      console.log("REGISTER RESULT", result);
      if (result.errors) {
        setError(result.errors[0].message);
        setTimeout(() => {
          setError(null);
        }, 3000);
      } else {
        navigate("/app");
      }
    }); 
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Modal show={true} onHide={() => navigate("/")}>
        <Modal.Header closeButton>
          <Modal.Title>Register</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRegister}>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" placeholder="Enter email" required  value={email} onChange={e=>setEmail(e.target.value)}/>
            </Form.Group>
            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" required  value={password} onChange={e=>setPassword(e.target.value)}/>
            </Form.Group>
            <Form.Group controlId="formBasicPasswordConfirm">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm Password"
                required  value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}
              />
            </Form.Group>
            {error && <Alert className="my-3" variant="danger">{error}</Alert>}
            <Button className="mt-3" variant="primary" type="submit">
              Register
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer className="text-center mt-4">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
          <p>
            Forgot your password? <Link to="/forgot-password">Reset it</Link>
          </p>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RegisterPage;
