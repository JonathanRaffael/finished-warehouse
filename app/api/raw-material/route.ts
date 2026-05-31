import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {

  try {

    const rawMaterials =
      await prisma.rawMaterialBatch.findMany({
        include: {
          rawMaterial: true,
          usages: true,
        },

        orderBy: {
          incomingDate: "desc",
        },
      });

    const formattedData =
      rawMaterials.map((item) => {

        /* ================= TOTAL OUT ================= */

        const totalOut =
          item.usages.reduce(
            (acc, usage) =>
              acc + usage.qtyUsed,
            0
          );

        /* ================= AUTO STATUS ================= */

        let status:
          | "ACTIVE"
          | "EMPTY"
          | "EXPIRED";

        if (
          new Date(item.expDate) <
          new Date()
        ) {

          status =
            "EXPIRED";

        } else if (
          item.balanceQty <= 0
        ) {

          status =
            "EMPTY";

        } else {

          status =
            "ACTIVE";
        }

        return {

          id: item.id,

          incomingDate:
            item.incomingDate,

          lotNo:
            item.lotNo,

          incomingQty:
            item.incomingQty,

          incomingWeight:
            item.incomingWeight,

          spq:
            item.spq,

          balanceQty:
            item.balanceQty,

          balanceWeight:
            item.balanceWeight,

          warehouse:
            item.warehouse,

          expDate:
            item.expDate,

          status,

          totalOut,

          rawMaterial:
            item.rawMaterial
              ? {
                  materialCode:
                    item.rawMaterial
                      .materialCode,

                  materialName:
                    item.rawMaterial
                      .materialName,
                }
              : null,

          usages:
            item.usages,
        };
      });

    return NextResponse.json(
      formattedData
    );

  } catch (error) {

    console.error(
      "[RAW_MATERIAL_GET_ERROR]",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch raw materials",
      },
      {
        status: 500,
      }
    );
  }
}
