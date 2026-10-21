import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// =====================
// UPDATE PRODUCT
// =====================
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const computerCode = body.computerCode?.trim();
    const partNo = body.partNo?.trim();
    const productName = body.productName?.trim();

    const initialStock =
      body.initialStock !== undefined
        ? Number(body.initialStock)
        : undefined;

    // =====================
    // VALIDATION
    // =====================
    if (!computerCode || !partNo || !productName) {
      return NextResponse.json(
        {
          success: false,
          message: "Data tidak lengkap!",
        },
        { status: 400 }
      );
    }

    if (
      initialStock !== undefined &&
      (Number.isNaN(initialStock) || initialStock < 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Initial stock tidak valid!",
        },
        { status: 400 }
      );
    }

    // =====================
    // CHECK PRODUCT EXISTS
    // =====================
    const product = await prisma.wipProduct.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product tidak ditemukan!",
        },
        { status: 404 }
      );
    }

    // =====================
    // CHECK DUPLICATE COMPUTER CODE
    // =====================
    const duplicate = await prisma.wipProduct.findFirst({
      where: {
        computerCode: {
          equals: computerCode,
          mode: "insensitive",
        },
        NOT: {
          id,
        },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "Computer Code already exists!",
        },
        { status: 400 }
      );
    }

    // =====================
    // UPDATE PRODUCT + STOCK
    // =====================
    const updated = await prisma.$transaction(async (tx) => {
      // Update WipProduct
      const updatedProduct = await tx.wipProduct.update({
        where: {
          id,
        },
        data: {
          computerCode,
          partNo,
          productName,
        },
      });

      // Update WipStock
      if (initialStock !== undefined) {
        await tx.wipStock.updateMany({
          where: {
            productId: id,
          },
          data: {
            initialStock,
          },
        });
      }

      return updatedProduct;
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal update product",
      },
      { status: 500 }
    );
  }
}

// =====================
// DELETE PRODUCT
// =====================
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // =====================
    // CHECK PRODUCT EXISTS
    // =====================
    const product = await prisma.wipProduct.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product tidak ditemukan!",
        },
        { status: 404 }
      );
    }

    // =====================
    // DELETE DATABASE
    // =====================
    await prisma.wipProduct.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product berhasil dihapus",
    });
  } catch (error: any) {
    console.error("DELETE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal menghapus product",
      },
      { status: 500 }
    );
  }
}