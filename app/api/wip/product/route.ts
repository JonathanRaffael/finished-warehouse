import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// =====================
// GET PRODUCT
// =====================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type");
    const search = searchParams.get("search")?.trim() || "";
    const computerCode =
      searchParams.get("computerCode")?.trim() || "";

    const limit = Number(searchParams.get("limit")) || 1000;
    const sort = searchParams.get("sort") || "asc";

    if (!type) {
      return NextResponse.json(
        {
          success: false,
          message: "Type is required!",
        },
        {
          status: 400,
        }
      );
    }

    // =====================
    // BUILD WHERE
    // =====================
    const where: any = {
      type: type as any,
    };

    // Search berdasarkan Computer Code secara spesifik
    if (computerCode) {
      where.computerCode = {
        equals: computerCode,
        mode: "insensitive",
      };
    }
    // Search umum
    else if (search) {
      where.OR = [
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
      ];
    }

    // =====================
    // GET PRODUCTS
    // =====================
    const products = await prisma.wipProduct.findMany({
      where,

      orderBy: {
        createdAt: sort === "desc" ? "desc" : "asc",
      },

      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error: any) {
    console.error("GET PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch products",
        data: [],
      },
      {
        status: 500,
      }
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
    const initialStock = Number(body.initialStock ?? 0);

    // =====================
    // VALIDATION
    // =====================
    if (!computerCode || !partNo || !productName || !type) {
      return NextResponse.json(
        {
          success: false,
          message: "Data tidak lengkap!",
        },
        {
          status: 400,
        }
      );
    }

    if (!["HT", "HK"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Type harus HT atau HK!",
        },
        {
          status: 400,
        }
      );
    }

    if (!Number.isFinite(initialStock) || initialStock < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Initial Stock tidak boleh negatif!",
        },
        {
          status: 400,
        }
      );
    }

    // =====================
    // CHECK DUPLICATE
    // =====================
    const existing = await prisma.wipProduct.findFirst({
      where: {
        computerCode: {
          equals: computerCode,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: `Computer Code "${existing.computerCode}" sudah terdaftar sebagai ${existing.type}.`,
          existingProduct: {
            id: existing.id,
            computerCode: existing.computerCode,
            partNo: existing.partNo,
            productName: existing.productName,
            type: existing.type,
          },
        },
        {
          status: 409,
        }
      );
    }

    // =====================
    // CREATE PRODUCT + STOCK
    // =====================
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.wipProduct.create({
        data: {
          computerCode,
          partNo,
          productName,
          type,
        },
      });

      const stock = await tx.wipStock.create({
        data: {
          productId: product.id,
          initialStock,
          incomingQty: 0,
          outgoingQty: 0,
          finalStock: initialStock,
        },
      });

      return {
        product,
        stock,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: result,
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    console.error("CREATE PRODUCT ERROR:", error);

    // =====================
    // PRISMA DUPLICATE ERROR
    // =====================
    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message: "Computer Code sudah terdaftar.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to create product",
      },
      {
        status: 500,
      }
    );
  }
}