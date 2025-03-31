// app/products/edit/[product_id]/page.js
import { db } from "@/dbConnect";
import ProductUpdateForm from "@/app/product/edit/product-update-form";

export async function generateMetadata({ params }) {
  return {
    title: "Edit Product",
  };
}

async function getProduct(productId) {
  try {
    const product = await db.collection("dashboard-collection").findOne({
      product_id: productId,
    });

    if (!product) {
      throw new Error("Product not found");
    }

    product._id = product._id.toString();

    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error("Failed to fetch product data");
  }
}

export default async function ProductEditPage({ params }) {
  try {
    const { product_id } = await params;
    const productData = await getProduct(product_id);

    return (
      <div>
        <ProductUpdateForm productData={productData} />
      </div>
    );
  } catch (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Error</h4>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }
}
