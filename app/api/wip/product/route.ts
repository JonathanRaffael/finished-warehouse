import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ✅ GET PRODUCT LIST (UNTUK DROPDOWN)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const products = await prisma.wipProduct.findMany({
      where: {
        type: type as any,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);

  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// ✅ CREATE PRODUCT
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const existing = await prisma.wipProduct.findUnique({
      where: {
        computerCode: body.computerCode,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Computer Code already exists!" },
        { status: 400 }
      );
    }

    const product = await prisma.wipProduct.create({
      data: {
        computerCode: body.computerCode,
        partNo: body.partNo,
        productName: body.productName,
        type: body.type,
      },
    });

   await prisma.wipStock.create({
  data: {
    productId: product.id,
    initialStock: Number(body.initialStock) || 0,
    incomingQty: 0,
    outgoingQty: 0,
    finalStock: Number(body.initialStock) || 0,
  },
});

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}