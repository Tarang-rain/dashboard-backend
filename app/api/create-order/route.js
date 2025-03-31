import { db } from "@/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

export const POST = async (req) => {
  const data = await req.json();
  const order_id = uuid();

  const {
    product_id,
    product_name,
    product_quantity,
    product_price,
    product_discount,
    product_variant,
    product_image,
    username,
    userid,
    email,
    phone,
  } = data;

  if (
    !product_id ||
    !product_name ||
    !Array.isArray(product_variant) ||
    product_variant.length === 0 ||
    !product_image ||
    username ||
    userid ||
    email ||
    phone
  ) {
    return NextResponse.json(
      { error: "Not all data are provided." },
      { status: 400 }
    );
  }

  const final_price =
    product_price * product_quantity * (1 - product_discount / 100);

  const finalData = {
    order_id,
    ...data,
    final_price,
  };

  const collection = db.collection("orders");
  const res = collection.insertOne(finalData);

  return NextResponse.json({ status: 201, message: "order created" });
};
