import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const data = await prisma.wipOutgoing.findMany({
      where: {
        product: {
          type: type as any,
        },
      },
      include: {
        product: true,
      },
      orderBy: {
        date: "desc",
      },
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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 🔍 VALIDASI
    if (!body.computerCode || !body.qty || !body.createdBy) {
      return NextResponse.json(
        { error: "Data tidak lengkap!" },
        { status: 400 }
      );
    }

    const qty = Number(body.qty);

    // 🔍 CARI PRODUCT
    const product = await prisma.wipProduct.findUnique({
      where: { computerCode: body.computerCode },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product tidak ditemukan!" },
        { status: 400 }
      );
    }

    // 🔍 AMBIL STOCK
    const stock = await prisma.wipStock.findUnique({
      where: { productId: product.id },
    });

    const initial = stock?.initialStock || 0;
    const currentIncoming = stock?.incomingQty || 0;
    const currentOutgoing = stock?.outgoingQty || 0;

    const currentFinal = initial + currentIncoming - currentOutgoing;

    // 🔥 VALIDASI STOCK (pakai perhitungan real)
    if (currentFinal < qty) {
      return NextResponse.json(
        { error: "Stock tidak cukup!" },
        { status: 400 }
      );
    }

    // 🔥 INSERT OUTGOING
    const outgoing = await prisma.wipOutgoing.create({
      data: {
        productId: product.id,
        qty: qty,
        createdBy: body.createdBy,
      },
    });

    // 🔥 HITUNG ULANG (INI KUNCI)
    const newOutgoing = currentOutgoing + qty;
    const newFinal = initial + currentIncoming - newOutgoing;

    // 🔥 UPDATE STOCK (NO MORE DECREMENT FINAL)
    await prisma.wipStock.upsert({
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

    return NextResponse.json(outgoing);

  } catch (error) {
    console.error("POST OUTGOING ERROR:", error);
    return NextResponse.json(
      { error: "Failed insert outgoing" },
      { status: 500 }
    );
  }
}