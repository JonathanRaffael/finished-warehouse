import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest
) {

  try {

    const body =
      await request.json();

    const {
      batchId,

      qtyUsed,

      remark,

      createdBy,
    } = body;

    /* ================= VALIDATION ================= */

    if (
      !batchId ||
      !qtyUsed ||
      !createdBy
    ) {

      return NextResponse.json(
        {
          message:
            "All fields are required",
        },
        {
          status: 400,
        }
      );
    }

    /* ================= FIND BATCH ================= */

    const batch =
      await prisma.rawMaterialBatch.findUnique({
        where: {
          id: batchId,
        },
      });

    if (!batch) {

      return NextResponse.json(
        {
          message:
            "Batch not found",
        },
        {
          status: 404,
        }
      );
    }

    /* ================= EXPIRED VALIDATION ================= */

    if (
      new Date(batch.expDate) <
      new Date()
    ) {

      return NextResponse.json(
        {
          message:
            "Material already expired",
        },
        {
          status: 400,
        }
      );
    }

    /* ================= EMPTY VALIDATION ================= */

    if (
      batch.balanceQty <= 0
    ) {

      return NextResponse.json(
        {
          message:
            "Stock already empty",
        },
        {
          status: 400,
        }
      );
    }

    /* ================= QTY VALIDATION ================= */

    if (
      Number(qtyUsed) >
      batch.balanceQty
    ) {

      return NextResponse.json(
        {
          message:
            "Qty exceeds available stock",
        },
        {
          status: 400,
        }
      );
    }

    /* ================= AUTO WEIGHT ================= */

    const weightUsed =
      Number(qtyUsed) *
      batch.spq;

    /* ================= UPDATE BALANCE ================= */

    const updatedQty =
      batch.balanceQty -
      Number(qtyUsed);

    const updatedWeight =
      batch.balanceWeight -
      weightUsed;

    /* ================= AUTO STATUS ================= */

    const status =
      updatedQty <= 0
        ? "EMPTY"
        : "ACTIVE";

    /* ================= TRANSACTION ================= */

    const result =
      await prisma.$transaction(
        async (tx) => {

          /* CREATE USAGE */

          const usage =
            await tx.rawMaterialUsage.create({
              data: {
                batchId,

                qtyUsed:
                  Number(
                    qtyUsed
                  ),

                weightUsed,

                remark,

                createdBy,
              },
            });

          /* UPDATE BATCH */

          await tx.rawMaterialBatch.update({
            where: {
              id: batchId,
            },

            data: {
              balanceQty:
                updatedQty,

              balanceWeight:
                updatedWeight,

              status,
            },
          });

          return usage;
        }
      );

    return NextResponse.json(
      {
        message:
          "Material usage created successfully",

        data: result,
      },
      {
        status: 201,
      }
    );

  } catch (error) {

    console.error(
      "[RAW_MATERIAL_USAGE_ERROR]",
      error
    );

    return NextResponse.json(
      {
        message:
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}

