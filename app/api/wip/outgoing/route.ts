import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// =====================
// GET OUTGOING
// =====================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json(
        { error: "Type is required!" },
        { status: 400 }
      );
    }

    const data = await prisma.wipOutgoing.findMany({
      where: {
        product: {
          type: type as any,
        },
      },
      include: {
        product: true,
      },
      orderBy: [
        { date: "asc" },        // 🔥 lama → baru
        { createdAt: "asc" },   // 🔥 backup biar stabil
      ],
    });

    return NextResponse.json(data);

  } catch (error) {
    console.error("WIP OUTGOING ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


// =====================
// POST OUTGOING
// =====================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const computerCode = body.computerCode?.trim();
    const createdBy = body.createdBy?.trim();
    const type = body.type;
    const date = body.date;

    const qty = Number(body.qty);

    // =====================
    // VALIDASI
    // =====================
    if (!computerCode || !createdBy || !qty || !type) {
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

    // =====================
    // CARI PRODUCT (TERBARU 🔥)
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
        createdAt: "desc", // 🔥 ambil paling baru
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

      // AMBIL STOCK
      const stock = await tx.wipStock.findUnique({
        where: { productId: product.id },
      });

      const initial = stock?.initialStock || 0;
      const currentIncoming = stock?.incomingQty || 0;
      const currentOutgoing = stock?.outgoingQty || 0;

      const currentFinal = initial + currentIncoming - currentOutgoing;

      // VALIDASI STOCK
      if (currentFinal < qty) {
        throw new Error("Stock tidak cukup!");
      }

      // INSERT OUTGOING
      const outgoing = await tx.wipOutgoing.create({
        data: {
          productId: product.id,
          qty: qty,
          createdBy,
          date: date ? new Date(date) : new Date(),
        },
      });

      // HITUNG ULANG
      const newOutgoing = currentOutgoing + qty;
      const newFinal = initial + currentIncoming - newOutgoing;

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