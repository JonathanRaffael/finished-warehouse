import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const data = await prisma.wipIncoming.findMany({
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
    console.error("WIP INCOMING ERROR:", error);
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

    // 🔥 INSERT INCOMING
    const incoming = await prisma.wipIncoming.create({
      data: {
        productId: product.id,
        qty: qty,
        createdBy: body.createdBy,
        ipqc: body.ipqc || null,
        remark: body.remark || null,
      },
    });

    // 🔥 AMBIL STOCK LAMA
    const stock = await prisma.wipStock.findUnique({
      where: { productId: product.id },
    });

    const initial = stock?.initialStock || 0;
    const currentIncoming = stock?.incomingQty || 0;
    const currentOutgoing = stock?.outgoingQty || 0;

    // 🔥 HITUNG ULANG (INI KUNCI)
    const newIncoming = currentIncoming + qty;
    const newFinal = initial + newIncoming - currentOutgoing;

    // 🔥 UPDATE STOCK (NO MORE INCREMENT FINAL)
    await prisma.wipStock.upsert({
      where: { productId: product.id },
      update: {
        incomingQty: newIncoming,
        finalStock: newFinal,
      },
      create: {
        productId: product.id,
        initialStock: 0,
        incomingQty: qty,
        outgoingQty: 0,
        finalStock: qty,
      },
    });

    return NextResponse.json(incoming);

  } catch (error) {
    console.error("POST INCOMING ERROR:", error);
    return NextResponse.json(
      { error: "Failed insert incoming" },
      { status: 500 }
    );
  }
}