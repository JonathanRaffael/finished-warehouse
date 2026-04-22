import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type");
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "asc";
    const limit = Number(searchParams.get("limit")) || 100;

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

          ...(search && {
            OR: [
              {
                computerCode: {
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
                productName: {
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
      orderBy: {
        product: {
          createdAt: sort === "desc" ? "desc" : "asc",
        },
      },
      take: limit,
    });

    const result = stocks.map((item) => {
      const initial = item.initialStock ?? 0;
      const incoming = item.incomingQty ?? 0;
      const outgoing = item.outgoingQty ?? 0;

      const finalStock = initial + incoming - outgoing;

      return {
        ...item,
        initialStock: initial,
        incomingQty: incoming,
        outgoingQty: outgoing,
        finalStock,
      };
    });

    return NextResponse.json({
      success: true,
      total: result.length,
      data: result,
    });

  } catch (error) {
    console.error("WIP STOCK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}