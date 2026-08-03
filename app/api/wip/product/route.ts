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
    const limit = Number(searchParams.get("limit")) || 1000;
    const sort = searchParams.get("sort") || "asc";

    if (!type) {
      return NextResponse.json(
        { success: false, message: "Type is required!" },
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
        message: error.message,
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

    if (initialStock < 0) {
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

    const existing = await prisma.wipProduct.findFirst({
      where: {
        computerCode: {
          equals: computerCode,
          mode: "insensitive",
        },
        type,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Computer Code already exists!",
        },
        {
          status: 400,
        }
      );
    }

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

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      data: result,
    });

  } catch (error: any) {
    console.error("CREATE PRODUCT ERROR:");
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}