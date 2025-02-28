import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { PersonCircle } from 'react-bootstrap-icons';

const Navigation = () => {
  const { user, logout } = useAuth();
  const isAdmin = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand 
          as={Link} 
          to={user ? "/home" : "/"} 
          style={{ cursor: 'pointer' }}
        >
          Note Elf
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Nav>
            {user ? (
              <NavDropdown 
                title={
                  <span>
                    <PersonCircle size={20} className="me-1" />
                    {user.firstname || 'User'}
                  </span>
                } 
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                {isAdmin && (
                  <NavDropdown.Item as={Link} to="/settings">Settings</NavDropdown.Item>
                )}
                <NavDropdown.Item as={Link} to="/properties">Properties</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
