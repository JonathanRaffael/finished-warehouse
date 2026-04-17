import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// =====================
// GET INCOMING
// =====================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type");
    const search = searchParams.get("search")?.trim() || "";
    const limit = Number(searchParams.get("limit")) || 100;

    if (!type) {
      return NextResponse.json(
        { error: "Type is required!" },
        { status: 400 }
      );
    }

    const data = await prisma.wipIncoming.findMany({
      where: {
        product: {
          type: type as any,
          ...(search && {
            OR: [
              {
                productName: {
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
                computerCode: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }),
        },
      },
      include: {
        product: true,
      },
      orderBy: [
        { date: "asc" },        // utama
        { createdAt: "asc" },   // backup biar stabil 🔥
      ],
      take: limit,
    });

    return NextResponse.json(data);

  } catch (error) {
    console.error("WIP INCOMING ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


// =====================
// POST INCOMING
// =====================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const computerCode = body.computerCode?.trim();
    const createdBy = body.createdBy?.trim();
    const ipqc = body.ipqc?.trim();
    const remark = body.remark?.trim();
    const type = body.type;
    const date = body.date;

    const parsedQty = Number(body.qty);

    // =====================
    // VALIDASI
    // =====================
    if (!computerCode || !createdBy || !parsedQty || !type) {
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

    // =====================
    // CARI PRODUCT (PRIORITAS TERBARU 🔥)
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
        createdAt: "desc", // 🔥 ambil yang paling baru
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

      // INSERT INCOMING
      const incoming = await tx.wipIncoming.create({
        data: {
          productId: product.id,
          qty: parsedQty,
          createdBy,
          ipqc: ipqc || null,
          remark: remark || null,
          date: date ? new Date(date) : new Date(),
        },
      });

      // AMBIL STOCK
      const stock = await tx.wipStock.findUnique({
        where: { productId: product.id },
      });

      const initial = stock?.initialStock || 0;
      const currentIncoming = stock?.incomingQty || 0;
      const currentOutgoing = stock?.outgoingQty || 0;

      // HITUNG ULANG
      const newIncoming = currentIncoming + parsedQty;
      const newFinal = initial + newIncoming - currentOutgoing;

      // UPSERT STOCK
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