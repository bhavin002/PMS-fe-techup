import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { PersonCircle } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand style={{ cursor: "pointer", fontWeight: "900", fontSize: "28px" }} onClick={() => navigate("/projects")}>PMS</Navbar.Brand>
        <Nav className="ms-auto">
          <NavDropdown
            title={<PersonCircle size={30} />}
            id="basic-nav-dropdown"
            align="end"
          >
            <NavDropdown.Item onClick={() => {
              localStorage.removeItem('authToken');
              navigate('/');
            }}>Logout</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;