import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {

  try {

    const batches =
      await prisma.rawMaterialBatch.findMany({
        include: {
          rawMaterial: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    const formatted =
      batches.map((item) => {

        const today =
          new Date();

        const expDate =
          new Date(
            item.expDate
          );

        let status:
          | "ACTIVE"
          | "EMPTY"
          | "EXPIRED";

        if (
          expDate <
          today
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

          materialCode:
            item.rawMaterial
              .materialCode,

          materialName:
            item.rawMaterial
              .materialName,

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
        };
      });

    return NextResponse.json(
      formatted
    );

  } catch (error) {

    console.error(
      "[RAW_MATERIAL_MASTER_GET_ERROR]",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch raw material master",
      },
      {
        status: 500,
      }
    );
  }
}

