import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
        product: {
          createdAt: "asc", // 🔥 FIX utama
        },
      },
    });

    const result = stocks.map((item) => {
      const initial = item.initialStock || 0;
      const incoming = item.incomingQty || 0;
      const outgoing = item.outgoingQty || 0;

      const final = initial + incoming - outgoing;

      return {
        ...item,
        finalStock: final,
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