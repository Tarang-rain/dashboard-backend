"use client";

import React, { useState } from "react";
import { Card, Badge, ListGroup, Button, Collapse } from "react-bootstrap";
import { useRouter } from "next/navigation";

const ProductCard = ({ product }) => {
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();

  const discountedPrice =
    product.product_price -
    (product.product_price * product.product_discount) / 100;

  return (
    <Card className="h-100 shadow-sm border-0 rounded">
      <Card.Img
        variant="top"
        src={product.thumbnail.url}
        style={{ height: "200px", objectFit: "cover" }}
      />
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Card.Title className="mb-0 fw-bold">
            {product.product_name}
          </Card.Title>
          <Badge bg="primary">{product.product_type}</Badge>
        </div>
        <Card.Text className="text-truncate" style={{ maxWidth: "100%" }}>
          {product.product_descriptions}
        </Card.Text>

        <ListGroup variant="flush" className="mb-3">
          <ListGroup.Item className="p-2">
            <div className="d-flex justify-content-between">
              <span className="text-muted">Price:</span>
              <span className="text-decoration-line-through text-danger">
                ${product.product_price}
              </span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Discounted:</span>
              <span className="text-success fw-bold">
                ${discountedPrice.toFixed(2)}
              </span>
            </div>
          </ListGroup.Item>
          <ListGroup.Item className="p-2">
            <div className="d-flex justify-content-between">
              <span className="text-muted">Stock:</span>
              <span>{product.product_stock} units</span>
            </div>
          </ListGroup.Item>
        </ListGroup>

        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => router.push(`product/edit/${product.product_id}`)}
        >
          View Details
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
