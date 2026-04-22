import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;

    // 🔴 VALIDATE ID
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 }
      );
    }

    // 🔴 PARSE BODY
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    const initialStock = Number(body.initialStock);

    // 🔴 VALIDATE INPUT
    if (!Number.isFinite(initialStock) || initialStock < 0) {
      return NextResponse.json(
        { success: false, message: "Initial stock must be a valid non-negative number" },
        { status: 400 }
      );
    }

    // 🔴 CHECK EXISTENCE
    const existing = await prisma.wipStock.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Stock data not found" },
        { status: 404 }
      );
    }

    // 🔴 UPDATE DATA
    const updated = await prisma.wipStock.update({
      where: { id },
      data: {
        initialStock,
      },
      include: {
        product: true,
      },
    });

    // 🔴 CALCULATE FINAL STOCK
    const finalStock =
      (updated.initialStock ?? 0) +
      (updated.incomingQty ?? 0) -
      (updated.outgoingQty ?? 0);

    // 🔴 SUCCESS RESPONSE
    return NextResponse.json({
      success: true,
      message: "Stock updated successfully",
      data: {
        ...updated,
        finalStock,
      },
    });

  } catch (error) {
    console.error("UPDATE STOCK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}