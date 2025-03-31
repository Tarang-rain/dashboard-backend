"use client";
import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { BarChart2, Users, ShoppingCart, IndianRupee } from "lucide-react";

const Details = () => {
  return (
    <Container>
      <Row className="g-4">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <BarChart2 size={24} className="mb-2 text-primary" />
              <Card.Title>Sales</Card.Title>
              <Card.Text className="h3">$24,500</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <Users size={24} className="mb-2 text-success" />
              <Card.Title>Customers</Card.Title>
              <Card.Text className="h3">1,250</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <ShoppingCart size={24} className="mb-2 text-warning" />
              <Card.Title>Orders</Card.Title>
              <Card.Text className="h3">350</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <IndianRupee className="mb-2 text-danger" />
              <Card.Title>Revenue</Card.Title>
              <Card.Text className="h3">₹ 0</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>Recent Activity</Card.Title>
              <Card.Text>
                This is a wider card with supporting text below as a natural
                lead-in to additional content. This content is a little bit
                longer.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Quick Stats</Card.Title>
              <ul className="list-unstyled mb-0">
                <li className="d-flex justify-content-between mb-2">
                  <span>New Users</span>
                  <span className="text-success">+25%</span>
                </li>
                <li className="d-flex justify-content-between mb-2">
                  <span>Bounce Rate</span>
                  <span className="text-danger">-12%</span>
                </li>
                <li className="d-flex justify-content-between">
                  <span>Page Views</span>
                  <span className="text-success">+18%</span>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Details;
