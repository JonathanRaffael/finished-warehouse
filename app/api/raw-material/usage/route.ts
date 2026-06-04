import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";

/* =========================================================
   GET USAGE HISTORY
========================================================= */

export async function GET() {
  try {
    const data =
      await prisma.rawMaterialUsage.findMany({
        include: {
          batch: {
            include: {
              rawMaterial: true,
            },
          },
        },

        orderBy: {
          usageDate: "desc",
        },
      });

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "[RAW_MATERIAL_USAGE_GET_ERROR]",
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

/* =========================================================
   CREATE USAGE
========================================================= */

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const {
      batchId,
      qtyUsed,
      usageDate,
      usageTime,
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

          availableQty:
            batch.balanceQty,

          requestedQty:
            Number(qtyUsed),
        },
        {
          status: 400,
        }
      );
    }

    /* ================= USAGE DATETIME ================= */

    const actualUsageDate =
      usageDate && usageTime
        ? new Date(
            `${usageDate}T${usageTime}:00`
          )
        : usageDate
          ? new Date(usageDate)
          : new Date();

    /* ================= AUTO WEIGHT ================= */

    const weightUsed =
      Number(qtyUsed) *
      batch.spq;

    /* ================= TRACEABILITY ================= */

    const balanceQtyBefore =
      batch.balanceQty;

    const balanceWeightBefore =
      batch.balanceWeight;

    const balanceQtyAfter =
      batch.balanceQty -
      Number(qtyUsed);

    const balanceWeightAfter =
      batch.balanceWeight -
      weightUsed;

    /* ================= STATUS ================= */

    const status =
      balanceQtyAfter <= 0
        ? "EMPTY"
        : "ACTIVE";

    /* ================= TRANSACTION ================= */

    const result =
      await prisma.$transaction(
        async (tx) => {
          const usage =
            await tx.rawMaterialUsage.create({
              data: {
                batchId,

                usageDate:
                  actualUsageDate,

                qtyUsed:
                  Number(
                    qtyUsed
                  ),

                weightUsed,

                balanceQtyBefore,

                balanceQtyAfter,

                balanceWeightBefore,

                balanceWeightAfter,

                remark,

                createdBy,
              },
            });

          await tx.rawMaterialBatch.update({
            where: {
              id: batchId,
            },

            data: {
              balanceQty:
                balanceQtyAfter,

              balanceWeight:
                balanceWeightAfter,

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
      "[RAW_MATERIAL_USAGE_POST_ERROR]",
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

