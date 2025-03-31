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

export const PUT = async (req, { params }) => {
  try {
    const { product_id } = await params;

    if (!product_id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

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

    // Find the existing product
    const existingProduct = await db
      .collection("dashboard-collection")
      .findOne({ product_id });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if new product name already exists (but skip if name hasn't changed)
    if (product_name && product_name !== existingProduct.product_name) {
      const nameExists = await db
        .collection("dashboard-collection")
        .findOne({ product_name, product_id: { $ne: product_id } });

      if (nameExists) {
        return NextResponse.json(
          { error: "A product with this name already exists" },
          { status: 409 }
        );
      }
    }

    // Validate product_tags if provided
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

    // Validate product_variants if provided
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

    // Handle image updates if new images are provided
    let updatedImages = existingProduct.product_images;

    if (
      product_images &&
      Array.isArray(product_images) &&
      product_images.length > 0
    ) {
      // Validate maximum 5 images
      if (product_images.length > 5) {
        return NextResponse.json(
          { error: "Maximum 5 product images are allowed" },
          { status: 400 }
        );
      }

      // Delete existing images from Cloudinary
      for (const image of existingProduct.product_images) {
        if (image.public_id) {
          try {
            await cloudinaryV2.uploader.destroy(image.public_id);
          } catch (deleteError) {
            console.error("Failed to delete old image:", deleteError);
          }
        }
      }

      // Upload new images
      updatedImages = [];
      for (const imageUrl of product_images) {
        try {
          // Skip upload if it's already a Cloudinary URL from our folder
          if (
            imageUrl.includes("cloudinary") &&
            imageUrl.includes("product_images")
          ) {
            // Extract existing image data
            const existingImage = existingProduct.product_images.find(
              (img) => img.url === imageUrl
            );
            if (existingImage) {
              updatedImages.push(existingImage);
              continue;
            }
          }

          // Upload new image with v2 and proper folder structure
          const uploadResponse = await cloudinaryV2.uploader.upload(imageUrl, {
            folder: "product_images",
            resource_type: "auto",
            use_filename: true,
            unique_filename: true,
            overwrite: false,
            public_id: `product_images/${uuid()}`, // Explicitly set the public_id with folder path
          });

          updatedImages.push({
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
    }

    // Create update object with only the provided fields
    const updateData = {
      ...(product_name && { product_name }),
      ...(product_type && { product_type }),
      ...(product_price && { product_price }),
      ...(product_descriptions && { product_descriptions }),
      ...(product_tags && { product_tags }),
      ...(product_sku && { product_sku }),
      ...(product_stock !== undefined && { product_stock }),
      ...(product_variants && { product_variants }),
      ...(updatedImages !== existingProduct.product_images && {
        product_images: updatedImages,
        thumbnail: updatedImages[0] || existingProduct.thumbnail,
      }),
      updated_at: new Date().toUTCString(),
    };

    // Handle discount separately (could be 0 which is falsy)
    if (product_discount !== undefined) {
      updateData.product_discount = product_discount;
    }

    // Update the product in the database
    const result = await db
      .collection("dashboard-collection")
      .updateOne({ product_id }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get the updated product
    const updatedProduct = await db
      .collection("dashboard-collection")
      .findOne({ product_id });

    return NextResponse.json(
      { message: "Product updated successfully", product: updatedProduct },
      { status: 200 }
    );
  } catch (err) {
    console.error(`Something went wrong`, err);
    return NextResponse.json(
      { error: "Failed to update product", details: err.message },
      { status: 500 }
    );
  }
};
