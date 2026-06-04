import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// =====================
// GET OUTGOING (FINAL 🚀)
// =====================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type");
    const search = searchParams.get("search")?.trim() || "";

    // ✅ PAGINATION
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    // ✅ SORT
    const sort =
      searchParams.get("sort") === "desc" ? "desc" : "asc";

    if (!type) {
      return NextResponse.json(
        { error: "Type is required!" },
        { status: 400 }
      );
    }

    // =====================
    // ✅ WHERE (TYPE SAFE)
    // =====================
    const productFilter: Prisma.WipProductWhereInput = {
      type: type as any,
    };

    if (search) {
      productFilter.OR = [
        { productName: { contains: search, mode: "insensitive" } },
        { partNo: { contains: search, mode: "insensitive" } },
        { computerCode: { contains: search, mode: "insensitive" } },
      ];
    }

    const whereCondition: Prisma.WipOutgoingWhereInput = {
      product: {
        is: productFilter,
      },
    };

    // =====================
    // QUERY DATA + TOTAL
    // =====================
    const [data, total] = await prisma.$transaction([
      prisma.wipOutgoing.findMany({
        where: whereCondition,
        include: {
          product: true,
        },

        // ✅ SORT STABIL (ANTI BUG)
        orderBy: [
          { createdAt: sort },
          { id: "asc" },
        ],

        skip,
        take: limit,
      }),

      prisma.wipOutgoing.count({
        where: whereCondition,
      }),
    ]);

    // =====================
    // RESPONSE
    // =====================
    return NextResponse.json({
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("WIP OUTGOING ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// =====================
// POST OUTGOING (FINAL 🔥)
// =====================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("=================================");
    console.log("BODY:", body);
    console.log("=================================");

    const computerCode = body.computerCode?.trim();
    const createdBy = body.createdBy?.trim();
    const type = body.type;

    const date = body.date ? new Date(body.date) : new Date();
    const qty = Number(body.qty);

    // =====================
    // VALIDASI
    // =====================
    if (!computerCode || !createdBy || !type) {
      return NextResponse.json(
        { error: "Data tidak lengkap!" },
        { status: 400 }
      );
    }

    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json(
        { error: "Qty harus lebih dari 0!" },
        { status: 400 }
      );
    }

    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "Format tanggal tidak valid!" },
        { status: 400 }
      );
    }

    // =====================
    // CARI PRODUCT
    // =====================
    const product = await prisma.wipProduct.findFirst({
      where: {
        computerCode: {
          equals: computerCode,
          mode: "insensitive",
        },
        type,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("PRODUCT FOUND:", product);

    if (!product) {
      return NextResponse.json(
        { error: "Product tidak ditemukan!" },
        { status: 400 }
      );
    }

    // =====================
    // TRANSACTION
    // =====================
    const result = await prisma.$transaction(async (tx) => {

      const stock = await tx.wipStock.findUnique({
        where: {
          productId: product.id,
        },
      });

      console.log("STOCK:", stock);

      const initial = stock?.initialStock || 0;
      const currentIncoming = stock?.incomingQty || 0;
      const currentOutgoing = stock?.outgoingQty || 0;

      const currentFinal =
        initial +
        currentIncoming -
        currentOutgoing;

      console.log("STOCK CALCULATION:", {
        initial,
        currentIncoming,
        currentOutgoing,
        currentFinal,
        qty,
      });

      // =====================
      // VALIDASI STOCK
      // =====================
      if (currentFinal < qty) {
        throw new Error(
          `Stock tidak cukup! Stock saat ini ${currentFinal}, request ${qty}`
        );
      }

      // =====================
      // INSERT OUTGOING
      // =====================
      const outgoing = await tx.wipOutgoing.create({
        data: {
          productId: product.id,
          qty,
          createdBy,
          date,
        },
      });

      console.log("OUTGOING CREATED:", outgoing);

      // =====================
      // UPDATE STOCK
      // =====================
      const newOutgoing =
        currentOutgoing + qty;

      const newFinal =
        initial +
        currentIncoming -
        newOutgoing;

      const updatedStock =
        await tx.wipStock.upsert({
          where: {
            productId: product.id,
          },
          update: {
            outgoingQty: newOutgoing,
            finalStock: newFinal,
          },
          create: {
            productId: product.id,
            initialStock: 0,
            incomingQty: 0,
            outgoingQty: qty,
            finalStock: -qty,
          },
        });

      console.log(
        "STOCK UPDATED:",
        updatedStock
      );

      return outgoing;
    });

    console.log("=================================");
    console.log("FINAL RESULT:", result);
    console.log("=================================");

    return NextResponse.json(result);

  } catch (error: any) {

    console.error("=================================");
    console.error("POST OUTGOING ERROR:");
    console.error(error);
    console.error("=================================");

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed insert outgoing",
      },
      {
        status: 500,
      }
    );
  }
}