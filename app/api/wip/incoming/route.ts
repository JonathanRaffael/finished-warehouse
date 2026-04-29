import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// =====================
// GET INCOMING (FINAL FIX 🚀)
// =====================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type");
    const search = searchParams.get("search")?.trim() || "";

    // PAGINATION
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    // 🔥 SORT (BERDASARKAN WAKTU INPUT / createdAt)
const sort =
  searchParams.get("sort") === "desc" ? "desc" : "asc";

    if (!type) {
      return NextResponse.json(
        { error: "Type is required!" },
        { status: 400 }
      );
    }

    // =====================
    // ✅ WHERE CONDITION (TYPE SAFE)
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

    const whereCondition: Prisma.WipIncomingWhereInput = {
      product: {
        is: productFilter,
      },
    };

    // =====================
    // QUERY DATA + TOTAL
    // =====================
    const [data, total] = await prisma.$transaction([
  prisma.wipIncoming.findMany({
    where: whereCondition,
    include: {
      product: true,
    },

    // 🔥 FIX SORT STABIL + BERDASARKAN WAKTU INPUT
    orderBy: [
      { createdAt: sort }, // utama (lama → baru)
      { id: "asc" },       // fallback biar stabil
    ],

    skip,
    take: limit,
  }),

  prisma.wipIncoming.count({
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
    console.error("WIP INCOMING ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


// =====================
// POST INCOMING (STABLE 🔥)
// =====================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const computerCode = body.computerCode?.trim();
    const createdBy = body.createdBy?.trim();
    const ipqc = body.ipqc?.trim();
    const remark = body.remark?.trim();
    const type = body.type;

    const date = body.date ? new Date(body.date) : new Date();
    const parsedQty = Number(body.qty);

    // VALIDASI
    if (!computerCode || !createdBy || !type) {
      return NextResponse.json(
        { error: "Data tidak lengkap!" },
        { status: 400 }
      );
    }

    if (isNaN(parsedQty) || parsedQty <= 0) {
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
      const incoming = await tx.wipIncoming.create({
        data: {
          productId: product.id,
          qty: parsedQty,
          createdBy,
          ipqc: ipqc || null,
          remark: remark || null,
          date,
        },
      });

      const stock = await tx.wipStock.findUnique({
        where: { productId: product.id },
      });

      const initial = stock?.initialStock || 0;
      const currentIncoming = stock?.incomingQty || 0;
      const currentOutgoing = stock?.outgoingQty || 0;

      const newIncoming = currentIncoming + parsedQty;
      const newFinal = initial + newIncoming - currentOutgoing;

      await tx.wipStock.upsert({
        where: { productId: product.id },
        update: {
          incomingQty: newIncoming,
          finalStock: newFinal,
        },
        create: {
          productId: product.id,
          initialStock: 0,
          incomingQty: parsedQty,
          outgoingQty: 0,
          finalStock: parsedQty,
        },
      });

      return incoming;
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("POST INCOMING ERROR:", error);
    return NextResponse.json(
      { error: "Failed insert incoming" },
      { status: 500 }
    );
  }
}