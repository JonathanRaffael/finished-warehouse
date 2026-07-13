import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const {
      date,
      computerCode,
      partNo,
      productName,
      incomingQty,
      responsiblePerson,
      batch,
    } = body;

    const qty = Number(incomingQty);

    if (Number.isNaN(qty) || qty <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Incoming Qty is invalid",
        },
        { status: 400 }
      );
    }

    const transaction = await prisma.incomingTransaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction not found",
        },
        { status: 404 }
      );
    }

    const outgoing = transaction.outgoingQty ?? 0;

    if (qty < outgoing) {
      return NextResponse.json(
        {
          success: false,
          message: `Incoming Qty cannot be smaller than Out Qty (${outgoing})`,
        },
        { status: 400 }
      );
    }

    const remainingQty = qty - outgoing;

    const updated = await prisma.incomingTransaction.update({
      where: { id },

      data: {
        date: date ? new Date(date) : transaction.date,

        computerCode:
          computerCode?.trim() || transaction.computerCode,

        partNo:
          partNo?.trim() || transaction.partNo,

        productName:
          productName?.trim() || transaction.productName,

        responsiblePerson:
          responsiblePerson?.trim() ||
          transaction.responsiblePerson,

        incomingQty: qty,

        remainingQty,

        batch: String(batch),

        status: remainingQty > 0 ? "OPEN" : "CLOSED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Incoming transaction updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}