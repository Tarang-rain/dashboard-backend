import React from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import ProductCard from "./product-card";
import { db } from "@/dbConnect";

const fetchProducts = async () => {
  try {
    const collection = db.collection("dashboard-collection");
    const res = await collection.find({}).toArray();

    const serializedProducts = res.map((product) => ({
      ...product,
      _id: product._id.toString(),
    }));

    return serializedProducts;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

const ProductList = async () => {
  let products = [];
  try {
    products = await fetchProducts();
  } catch (error) {
    return (
      <Container className="mt-4">
        <div className="alert alert-danger" role="alert">
          Failed to load products.
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2>Products</h2>
      <Row xs={1} md={2} lg={3} className="g-4">
        {products.map((product) => (
          <Col key={product.product_id}>
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default ProductList;
