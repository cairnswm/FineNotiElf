import React from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { Person } from "react-bootstrap-icons";
import { Link } from "react-router-dom";

const PageHeader = () => {
  return (
    <Navbar bg="secondary" variant="dark" expand="lg" className="px-3">
      <Navbar.Brand as={Link} to="/app">Noti Elf</Navbar.Brand>
        <Nav style={{ marginLeft: 'auto' }}>
          <NavDropdown title={<Person />} id="basic-nav-dropdown" align="end">
            <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/">Logout</NavDropdown.Item>
          </NavDropdown>
        </Nav>
    </Navbar>
  );
};

export default PageHeader;
