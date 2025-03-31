"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Card,
  Alert,
  InputGroup,
} from "react-bootstrap";
import { X, Plus } from "lucide-react";

const ProductForm = () => {
  const [imageUrls, setImageUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [variants, setVariants] = useState([{ name: "", options: [""] }]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      product_name: "",
      product_type: "",
      product_price: "",
      product_descriptions: "",
      product_tags: "",
      product_discount: "",
      product_sku: "",
      product_stock: "",
    },
  });

  useEffect(() => {
    console.log(tags);
  }, [tags]);
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (imageUrls.length + files.length > 5) {
      setFormError("Maximum 5 images allowed");
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrls((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setVariants([...variants, { name: "", options: [""] }]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const addOption = (variantIndex) => {
    const newVariants = [...variants];
    newVariants[variantIndex].options.push("");
    setVariants(newVariants);
  };

  const removeOption = (variantIndex, optionIndex) => {
    const newVariants = [...variants];
    newVariants[variantIndex].options = newVariants[
      variantIndex
    ].options.filter((_, i) => i !== optionIndex);
    setVariants(newVariants);
  };

  const handleVariantChange = (variantIndex, field, value) => {
    const newVariants = [...variants];
    newVariants[variantIndex][field] = value;
    setVariants(newVariants);
  };

  const handleOptionChange = (variantIndex, optionIndex, value) => {
    const newVariants = [...variants];
    newVariants[variantIndex].options[optionIndex] = value;
    setVariants(newVariants);
  };

  const handlePriceChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setValue("product_price", val);
  };

  const handleDiscountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setValue("product_discount", val);
  };
  const handleStockChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setValue("product_stock", val);
  };

  const handleTagInput = (e) => {
    const value = e.target.value;
    setTagInput(value);

    // Add tag when space or comma is entered
    if (value.endsWith(" ") || value.endsWith(",")) {
      const newTag = value.trim().replace(/,+$/, "");
      if (newTag && !tags.includes(newTag)) {
        const updatedTags = [...tags, newTag];
        setTags(updatedTags);
        setValue("product_tags", updatedTags.join(","));
      }
      setTagInput("");
    }
  };

  const addTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const updatedTags = [...tags, tagInput.trim()];
      setTags(updatedTags);
      setValue("product_tags", updatedTags.join(","));
      setTagInput("");
    }
  };

  const removeTag = (index) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    setTags(updatedTags);
    setValue("product_tags", updatedTags.join(","));
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setFormError("");
      setFormSuccess("");

      // Validate images
      if (imageUrls.length === 0) {
        setFormError("At least one product image is required");
        setIsSubmitting(false);
        return;
      }

      // Process tags
      const tagsArray = data.product_tags
        ? data.product_tags.split(",").map((tag) => tag.trim())
        : [];

      // Process variants
      const processedVariants = variants
        .filter((v) => v.name && v.options.some((o) => o))
        .map((v) => ({
          name: v.name,
          options: v.options.filter((o) => o),
        }));

      const productData = {
        ...data,
        product_price: parseFloat(data.product_price),
        product_discount: data.product_discount
          ? parseFloat(data.product_discount)
          : undefined,
        product_stock: parseInt(data.product_stock, 10),
        product_tags: tagsArray,
        product_images: imageUrls,
        product_variants: processedVariants,
      };

      const response = await fetch("/api/upload-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create product");
      }

      setFormSuccess("Product created successfully!");
      reset();
      setImageUrls([]);
      setVariants([{ name: "", options: [""] }]);
    } catch (error) {
      console.error("Error creating product:", error);
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Header as="h5" className="bg-primary text-white">
          Add New Product
        </Card.Header>
        <Card.Body>
          {formError && <Alert variant="danger">{formError}</Alert>}
          {formSuccess && <Alert variant="success">{formSuccess}</Alert>}

          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name*</Form.Label>
                  <Form.Control
                    type="text"
                    isInvalid={!!errors.product_name}
                    {...register("product_name", {
                      required: "Product name is required",
                    })}
                  />
                  {errors.product_name && (
                    <Form.Control.Feedback type="invalid">
                      {errors.product_name.message}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Type*</Form.Label>
                  <Form.Control
                    type="text"
                    isInvalid={!!errors.product_type}
                    {...register("product_type", {
                      required: "Product type is required",
                    })}
                  />
                  {errors.product_type && (
                    <Form.Control.Feedback type="invalid">
                      {errors.product_type.message}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (Rupee)*</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>₹</InputGroup.Text>
                    <Form.Control
                      type="text"
                      isInvalid={!!errors.product_price}
                      {...register("product_price", {
                        required: "Price is required",
                        min: { value: 0, message: "Price must be positive" },
                        pattern: {
                          value: /^[0-9]+$/, // Regex to allow only numbers
                          message: "Only numbers are allowed",
                        },
                      })}
                      onInput={handlePriceChange}
                    />
                    {errors.product_price && (
                      <Form.Control.Feedback type="invalid">
                        {errors.product_price.message}
                      </Form.Control.Feedback>
                    )}
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Discount (%)</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      isInvalid={!!errors.product_discount}
                      {...register("product_discount", {
                        min: {
                          value: 0,
                          message: "Discount must be between 0-100%",
                        },
                        max: {
                          value: 100,
                          message: "Discount must be between 0-100%",
                        },
                      })}
                      onInput={handleDiscountChange}
                    />
                    <InputGroup.Text>%</InputGroup.Text>
                    {errors.product_discount && (
                      <Form.Control.Feedback type="invalid">
                        {errors.product_discount.message}
                      </Form.Control.Feedback>
                    )}
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock Quantity*</Form.Label>
                  <Form.Control
                    type="text"
                    min="0"
                    isInvalid={!!errors.product_stock}
                    {...register("product_stock", {
                      required: "Stock quantity is required",
                      min: {
                        value: 0,
                        message: "Stock must be a positive number",
                      },
                    })}
                    onInput={handleStockChange}
                  />
                  {errors.product_stock && (
                    <Form.Control.Feedback type="invalid">
                      {errors.product_stock.message}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>SKU (Stock Keeping Unit)*</Form.Label>
              <Form.Control
                type="text"
                isInvalid={!!errors.product_sku}
                {...register("product_sku", { required: "SKU is required" })}
              />
              {errors.product_sku && (
                <Form.Control.Feedback type="invalid">
                  {errors.product_sku.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Product Description*</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                isInvalid={!!errors.product_descriptions}
                {...register("product_descriptions", {
                  required: "Product description is required",
                })}
              />
              {errors.product_descriptions && (
                <Form.Control.Feedback type="invalid">
                  {errors.product_descriptions.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tags (comma separated)</Form.Label>
              <div className="d-flex">
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Type and press space or comma to add"
                    value={tagInput}
                    onChange={handleTagInput}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "Space") {
                        e.preventDefault();
                        addTag(e);
                      }
                    }}
                  />
                  <Button variant="outline-secondary" onClick={addTag}>
                    Add
                  </Button>
                </InputGroup>
              </div>
              <input
                type="hidden"
                {...register("product_tags")}
                value={tags.join(",")}
              />
              <div className="mt-2 d-flex flex-wrap">
                {tags.map((tag, index) => (
                  <div
                    bg="dark"
                    className="me-2 mb-2 d-flex align-items-center"
                    key={index}
                    style={{ padding: "8px 12px" }}
                  >
                    {tag}
                    <Button
                      variant="link"
                      className="p-0 ms-2 "
                      onClick={() => removeTag(index)}
                      style={{ fontSize: "14px" }}
                    >
                      <X size={14} style={{ color: "red" }} />
                    </Button>
                  </div>
                ))}
              </div>
            </Form.Group>

            {/* Product Images */}
            <Form.Group className="mb-3">
              <Form.Label>Product Images* (Max 5)</Form.Label>
              <div className="mb-2">
                <Form.Control
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
                <Form.Text className="text-muted">
                  Upload up to 5 product images. First image will be used as
                  thumbnail.
                </Form.Text>
              </div>

              <div className="d-flex flex-wrap mt-2 gap-2">
                {imageUrls.map((url, index) => (
                  <div
                    key={index}
                    className="position-relative"
                    style={{ width: "120px", height: "120px" }}
                  >
                    <img
                      src={url}
                      alt={`Product preview ${index}`}
                      className="img-thumbnail"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0"
                      onClick={() => removeImage(index)}
                    >
                      <X size={14} />
                    </Button>
                    {index === 0 && (
                      <span className="position-absolute bottom-0 start-0 bg-primary text-white px-2 py-1 small">
                        Thumbnail
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Form.Group>

            {/* Product Variants */}
            <Card className="mb-3">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Product Variants (Optional)</h6>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={addVariant}
                  >
                    <Plus size={16} /> Add Variant
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {variants.map((variant, variantIndex) => (
                  <div key={variantIndex} className="mb-3 border p-3 rounded">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">Variant {variantIndex + 1}</h6>
                      {variantIndex > 0 && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeVariant(variantIndex)}
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>

                    <Form.Group className="mb-2">
                      <Form.Label>Variant Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g. Color, Size, Material"
                        value={variant.name}
                        onChange={(e) =>
                          handleVariantChange(
                            variantIndex,
                            "name",
                            e.target.value
                          )
                        }
                      />
                    </Form.Group>

                    <Form.Label>Options</Form.Label>
                    {variant.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="d-flex mb-2">
                        <Form.Control
                          type="text"
                          placeholder="e.g. Red, XL, Cotton"
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(
                              variantIndex,
                              optionIndex,
                              e.target.value
                            )
                          }
                        />
                        <Button
                          variant="outline-danger"
                          className="ms-2"
                          disabled={variant.options.length <= 1}
                          onClick={() =>
                            removeOption(variantIndex, optionIndex)
                          }
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}

                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => addOption(variantIndex)}
                    >
                      <Plus size={16} /> Add Option
                    </Button>
                  </div>
                ))}
              </Card.Body>
            </Card>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button
                variant="outline-secondary"
                type="button"
                onClick={() => {
                  reset();
                  setImageUrls([]);
                  setVariants([{ name: "", options: [""] }]);
                  setFormError("");
                  setFormSuccess("");
                }}
              >
                Reset
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Product"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProductForm;
