"use client";

import React from "react";
import { Container, Row, Col, Nav, Navbar, Card } from "react-bootstrap";

const DashboardNavbar = () => {
  return (
    <Navbar className="mb-4">
      <Container>
        <Navbar.Brand href="/">Dashboard </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="#profile">Profile</Nav.Link>
            <Nav.Link className="text-decoration-none" href={`/create-product`}>
              Add Product
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default DashboardNavbar;
