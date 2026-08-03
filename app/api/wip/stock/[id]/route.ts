import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ======================
// UPDATE STOCK
// ======================
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid ID",
        },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body",
        },
        { status: 400 }
      );
    }

    const initialStock = Number(body.initialStock);

    if (!Number.isFinite(initialStock) || initialStock < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Initial stock must be a valid non-negative number",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.wipStock.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Stock data not found",
        },
        { status: 404 }
      );
    }

    const updated = await prisma.wipStock.update({
      where: {
        id,
      },
      data: {
        initialStock,
        finalStock:
          initialStock +
          (existing.incomingQty ?? 0) -
          (existing.outgoingQty ?? 0),
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Stock updated successfully",
      data: updated,
    });

  } catch (error) {
    console.error("UPDATE STOCK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================
// DELETE STOCK
// ======================
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid ID",
        },
        {
          status: 400,
        }
      );
    }

    const existing = await prisma.wipStock.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Stock not found",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.wipStock.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Stock deleted successfully",
    });

  } catch (error) {
    console.error("DELETE STOCK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}