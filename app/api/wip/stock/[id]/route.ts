import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> } // 🔥 WAJIB
) {
  try {
    // 🔥 UNWRAP PARAMS
    const { id } = await context.params;

    const body = await req.json();
    const initialStock = Number(body.initialStock);

    // VALIDASI
    if (!id) {
      return NextResponse.json(
        { error: "ID tidak ditemukan!" },
        { status: 400 }
      );
    }

    if (isNaN(initialStock) || initialStock < 0) {
      return NextResponse.json(
        { error: "Initial stock tidak valid!" },
        { status: 400 }
      );
    }

    // UPDATE
    const updated = await prisma.wipStock.update({
      where: { id }, // ✅ sekarang aman
      data: {
        initialStock,
      },
      include: {
        product: true,
      },
    });

    const finalStock =
      (updated.initialStock ?? 0) +
      (updated.incomingQty ?? 0) -
      (updated.outgoingQty ?? 0);

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        finalStock,
      },
    });

  } catch (error) {
    console.error("UPDATE STOCK ERROR:", error);

    return NextResponse.json(
      { error: "Failed to update stock" },
      { status: 500 }
    );
  }
}