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

    // =========================
    // FILTER PRODUCT
    // =========================
    const productWhere: any = {
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
    };

    // =========================
    // GET STOCK + PRODUCT
    // =========================
    const stocks = await prisma.wipStock.findMany({
      where: {
        product: productWhere,
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

    // =========================
    // NO DATA
    // =========================
    if (stocks.length === 0) {
      return NextResponse.json({
        success: true,
        total: 0,
        data: [],
      });
    }

    // =========================
    // PRODUCT IDS
    // =========================
    const productIds = stocks.map((item) => item.productId);

    // =========================
    // GET ALL INCOMING AT ONCE
    // =========================
    const incomingGroups = await prisma.wipIncoming.groupBy({
      by: ["productId"],
      where: {
        productId: {
          in: productIds,
        },
      },
      _sum: {
        qty: true,
      },
    });

    // =========================
    // GET ALL OUTGOING AT ONCE
    // =========================
    const outgoingGroups = await prisma.wipOutgoing.groupBy({
      by: ["productId"],
      where: {
        productId: {
          in: productIds,
        },
      },
      _sum: {
        qty: true,
      },
    });

    // =========================
    // CONVERT TO MAP
    // =========================
    const incomingMap = new Map(
      incomingGroups.map((item) => [
        item.productId,
        item._sum.qty ?? 0,
      ])
    );

    const outgoingMap = new Map(
      outgoingGroups.map((item) => [
        item.productId,
        item._sum.qty ?? 0,
      ])
    );

    // =========================
    // CALCULATE STOCK
    // =========================
    const result = stocks.map((item) => {
      const initial = item.initialStock ?? 0;

      const incoming =
        incomingMap.get(item.productId) ?? 0;

      const outgoing =
        outgoingMap.get(item.productId) ?? 0;

      const finalStock =
        initial + incoming - outgoing;

      return {
        ...item,
        initialStock: initial,
        incomingQty: incoming,
        outgoingQty: outgoing,
        finalStock,
      };
    });

    // =========================
    // RESPONSE
    // =========================
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