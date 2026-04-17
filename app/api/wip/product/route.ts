import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// =====================
// GET PRODUCT
// =====================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type");
    const search = searchParams.get("search") || "";
    const limit = Number(searchParams.get("limit")) || 20;
    const sort = searchParams.get("sort") || "asc"; // 🔥 dynamic

    if (!type) {
      return NextResponse.json(
        { error: "Type is required!" },
        { status: 400 }
      );
    }

    const products = await prisma.wipProduct.findMany({
      where: {
        type: type as any,
        ...(search && {
          OR: [
            {
              computerCode: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              partNo: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              productName: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }),
      },
      orderBy: {
        createdAt: sort === "desc" ? "desc" : "asc", // 🔥 fleksibel
      },
      take: limit,
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


// =====================
// CREATE PRODUCT
// =====================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const computerCode = body.computerCode?.trim();
    const partNo = body.partNo?.trim();
    const productName = body.productName?.trim();
    const type = body.type;
    const initialStock = Number(body.initialStock) || 0;

    // =====================
    // VALIDASI
    // =====================
    if (!computerCode || !partNo || !productName || !type) {
      return NextResponse.json(
        { error: "Data tidak lengkap!" },
        { status: 400 }
      );
    }

    if (initialStock < 0) {
      return NextResponse.json(
        { error: "Initial stock tidak boleh negatif!" },
        { status: 400 }
      );
    }

    // =====================
    // CEK DUPLIKAT (CASE INSENSITIVE)
    // =====================
    const existing = await prisma.wipProduct.findFirst({
      where: {
        computerCode: {
          equals: computerCode,
          mode: "insensitive",
        },
        type: type, // 🔥 penting (biar HT & HK bisa beda)
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Computer Code already exists!" },
        { status: 400 }
      );
    }

    // =====================
    // TRANSACTION
    // =====================
    const result = await prisma.$transaction(async (tx) => {

      // CREATE PRODUCT
      const product = await tx.wipProduct.create({
        data: {
          computerCode,
          partNo,
          productName,
          type,
        },
      });

      // CREATE STOCK
      await tx.wipStock.create({
        data: {
          productId: product.id,
          initialStock: initialStock,
          incomingQty: 0,
          outgoingQty: 0,
          finalStock: initialStock,
        },
      });

      return product;
    });

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}