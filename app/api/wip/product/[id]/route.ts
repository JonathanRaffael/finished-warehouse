import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// =====================
// UPDATE PRODUCT
// =====================
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const computerCode = body.computerCode?.trim();
    const partNo = body.partNo?.trim();
    const productName = body.productName?.trim();

    // =====================
    // VALIDASI
    // =====================
    if (!computerCode || !partNo || !productName) {
      return NextResponse.json(
        { error: "Data tidak lengkap!" },
        { status: 400 }
      );
    }

    // =====================
    // CEK DUPLIKAT (EXCLUDE DIRI SENDIRI)
    // =====================
    const existing = await prisma.wipProduct.findFirst({
      where: {
        computerCode: {
          equals: computerCode,
          mode: "insensitive",
        },
        NOT: {
          id: params.id, // 🔥 penting
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Computer Code already exists!" },
        { status: 400 }
      );
    }

    // =====================
    // UPDATE
    // =====================
    const updated = await prisma.wipProduct.update({
      where: { id: params.id },
      data: {
        computerCode,
        partNo,
        productName,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });

  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}