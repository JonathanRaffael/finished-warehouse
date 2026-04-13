import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as "HT" | "HK";

    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }

    // 🔥 GET PRODUCTS + STOCK
    const products = await prisma.wipProduct.findMany({
      where: { type },
      include: {
        stock: true,
      },
    });

    // 🔥 TODAY RANGE
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 🔥 INCOMING TODAY
    const incomingToday = await prisma.wipIncoming.aggregate({
      _sum: { qty: true },
      where: {
        product: { type },
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    // 🔥 OUTGOING TODAY
    const outgoingToday = await prisma.wipOutgoing.aggregate({
      _sum: { qty: true },
      where: {
        product: { type },
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    let lowStock = 0;
let outOfStock = 0;

for (const p of products) {
  const initial = p.stock?.initialStock ?? 0;
  const incoming = p.stock?.incomingQty ?? 0;
  const outgoing = p.stock?.outgoingQty ?? 0;

  const finalStock = initial + incoming - outgoing;

  if (finalStock <= 0) outOfStock++;
  else if (finalStock < 50) lowStock++;
}

    return NextResponse.json({
      totalProducts: products.length,
      lowStock,
      outOfStock,
      totalIncomingToday: incomingToday._sum.qty ?? 0,
      totalOutgoingToday: outgoingToday._sum.qty ?? 0,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}