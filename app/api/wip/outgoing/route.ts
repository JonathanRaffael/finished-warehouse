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
    // CARI PRODUCT TERBARU
    // =====================
    const product = await prisma.wipProduct.findFirst({
      where: {
        computerCode: {
          equals: computerCode,
          mode: "insensitive",
        },
        type: type,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

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

      // GET STOCK
      const stock = await tx.wipStock.findUnique({
        where: { productId: product.id },
      });

      const initial = stock?.initialStock || 0;
      const currentIncoming = stock?.incomingQty || 0;
      const currentOutgoing = stock?.outgoingQty || 0;

      const currentFinal =
        initial + currentIncoming - currentOutgoing;

      // ❗ VALIDASI STOCK
      if (currentFinal < qty) {
        return NextResponse.json(
          { error: "Stock tidak cukup!" },
          { status: 400 }
        );
      }

      // INSERT OUTGOING
      const outgoing = await tx.wipOutgoing.create({
        data: {
          productId: product.id,
          qty,
          createdBy,
          date,
        },
      });

      // HITUNG ULANG STOCK
      const newOutgoing = currentOutgoing + qty;
      const newFinal =
        initial + currentIncoming - newOutgoing;

      // UPDATE STOCK
      await tx.wipStock.upsert({
        where: { productId: product.id },
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

      return outgoing;
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("POST OUTGOING ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Failed insert outgoing" },
      { status: 500 }
    );
  }
}