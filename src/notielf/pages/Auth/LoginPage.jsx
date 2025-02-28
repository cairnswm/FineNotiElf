import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Button, Form, Alert } from "react-bootstrap";

import useAuth from "../../auth/context/useauth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    login(email, password).then((result) => {
      console.log("LOGIN RESULT", result);
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
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleLogin}>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            {error && <Alert className="my-3" variant="danger">{error}</Alert>}
            <Button className="mt-3" variant="primary" type="submit">
              Login
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer className="text-end mt-4">
          <div>
            Don't have an account? <Link to="/register">Register</Link>
          </div>
          <div>
            Forgot your password? <Link to="/forgot-password">Reset it</Link>
          </div>
          <div style={{ display: "none" }}>
            <Link to="/">Hide link</Link>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LoginPage;
