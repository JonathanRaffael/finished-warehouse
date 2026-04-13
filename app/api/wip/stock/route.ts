import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    // 🔥 GET STOCK + PRODUCT
    const stocks = await prisma.wipStock.findMany({
      where: {
        product: {
          type: type as any,
        },
      },
      include: {
        product: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // 🔥 HITUNG ULANG FINAL STOCK (INI KUNCI)
    const result = stocks.map((item) => {
      const initial = item.initialStock || 0;
      const incoming = item.incomingQty || 0;
      const outgoing = item.outgoingQty || 0;

      const final = initial + incoming - outgoing;

      return {
        ...item,
        finalStock: final, // override hasil DB
      };
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("WIP STOCK ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}