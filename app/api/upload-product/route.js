import { db } from "@/dbConnect";
import { v4 as uuid } from "uuid";
import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";

// Configure Cloudinary with v2
const cloudinaryV2 = cloudinary.v2;

cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const POST = async (req, res) => {
  try {
    const data = await req.json();

    const {
      product_name,
      product_type,
      product_price,
      product_descriptions,
      product_tags,
      product_discount,
      product_images,
      product_sku,
      product_stock,
      product_variants,
    } = data;

    // Validation
    // 1. Check if required fields are present
    if (
      !product_name ||
      !product_type ||
      !product_price ||
      !product_descriptions ||
      !product_sku ||
      !product_stock
    ) {
      return NextResponse.json(
        { error: "Missing required product information" },
        { status: 400 }
      );
    }

    // 2. Validate product_images (at least one is necessary)
    if (
      !product_images ||
      !Array.isArray(product_images) ||
      product_images.length === 0
    ) {
      return NextResponse.json(
        { error: "At least one product image is required" },
        { status: 400 }
      );
    }

    // 3. Limit to 5 images maximum
    if (product_images.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 product images are allowed" },
        { status: 400 }
      );
    }

    // 4. Check if product name already exists
    const existingProduct = await db
      .collection("products")
      .findOne({ product_name });
    if (existingProduct) {
      return NextResponse.json(
        { error: "A product with this name already exists" },
        { status: 409 }
      );
    }

    // 5. Validate product_tags is an array of strings
    if (
      product_tags &&
      (!Array.isArray(product_tags) ||
        !product_tags.every((tag) => typeof tag === "string"))
    ) {
      return NextResponse.json(
        { error: "Product tags must be an array of strings" },
        { status: 400 }
      );
    }

    // 6. Validate product_variants is an array of objects
    if (
      product_variants &&
      (!Array.isArray(product_variants) ||
        !product_variants.every((variant) => typeof variant === "object"))
    ) {
      return NextResponse.json(
        { error: "Product variants must be an array of objects" },
        { status: 400 }
      );
    }

    // Upload images to Cloudinary
    const uploadedImages = [];
    for (const imageUrl of product_images) {
      try {
        // Use v2 and ensure the folder path is included in the public_id
        const uploadResponse = await cloudinaryV2.uploader.upload(imageUrl, {
          folder: "product_images",
          resource_type: "auto",
          use_filename: true,
          unique_filename: true,
          overwrite: false,
          public_id: `product_images/${uuid()}`, // Explicitly set the public_id with folder path
        });

        uploadedImages.push({
          url: uploadResponse.secure_url,
          public_id: uploadResponse.public_id,
        });
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload product images" },
          { status: 500 }
        );
      }
    }

    // Create product object with validated data
    const product = {
      product_id: uuid(),
      product_name,
      product_type,
      product_price,
      product_descriptions,
      product_tags: Array.isArray(product_tags) ? product_tags : [],
      product_sku,
      product_stock,
      product_variants: Array.isArray(product_variants) ? product_variants : [],
      thumbnail: uploadedImages[0],
      product_images: uploadedImages,
      created_at: new Date().toUTCString(),
      updated_at: new Date().toUTCString(),
    };

    // Add discount only if provided
    if (product_discount !== undefined) {
      product.product_discount = product_discount;
    }

    // Save product to database
    await db.collection("dashboard-collection").insertOne(product);

    return NextResponse.json(
      { message: "Product created successfully", product },
      { status: 201 }
    );
  } catch (err) {
    console.error(`Something went wrong`, err);
    return NextResponse.json(
      { error: "Failed to create product", details: err.message },
      { status: 500 }
    );
  }
};
