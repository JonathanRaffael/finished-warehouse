import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest
) {

  try {

    const body =
      await req.json();

    const {
      materialCode,

      materialName,

      incomingDate,

      lotNo,

      incomingQty,

      incomingWeight,

      spq,

      warehouse,

      expDate,
    } = body;

    /* ================= VALIDATION ================= */

    if (
      !materialCode ||
      !materialName ||
      !incomingDate ||
      !lotNo ||
      !incomingQty ||
      !incomingWeight ||
      !spq ||
      !warehouse ||
      !expDate
    ) {

      return NextResponse.json(
        {
          error:
            "All fields are required",
        },
        {
          status: 400,
        }
      );
    }

    /* ================= FIND MATERIAL ================= */

    let rawMaterial =
      await prisma.rawMaterial.findUnique({
        where: {
          materialCode,
        },
      });

    /* ================= CREATE MATERIAL ================= */

    if (!rawMaterial) {

      rawMaterial =
        await prisma.rawMaterial.create({
          data: {
            materialCode,

            materialName,
          },
        });
    }

    /* ================= CHECK LOT ================= */

    const existingLot =
      await prisma.rawMaterialBatch.findFirst({
        where: {
          lotNo,
        },
      });

    if (existingLot) {

      return NextResponse.json(
        {
          error:
            "Lot number already exists",
        },
        {
          status: 400,
        }
      );
    }

    /* ================= STATUS ================= */

    let status:
      | "ACTIVE"
      | "EMPTY"
      | "EXPIRED" =
      "ACTIVE";

    const today =
      new Date();

    const expiredDate =
      new Date(expDate);

    if (
      expiredDate <
      today
    ) {

      status =
        "EXPIRED";
    }

    /* ================= CREATE BATCH ================= */

    const batch =
      await prisma.rawMaterialBatch.create({
        data: {
          rawMaterialId:
            rawMaterial.id,

          incomingDate:
            new Date(
              incomingDate
            ),

          lotNo,

          incomingQty:
            Number(
              incomingQty
            ),

          incomingWeight:
            Number(
              incomingWeight
            ),

          spq:
            Number(spq),

          balanceQty:
            Number(
              incomingQty
            ),

          balanceWeight:
            Number(
              incomingWeight
            ),

          warehouse,

          expDate:
            new Date(
              expDate
            ),

          status,

          createdBy:
            "ADMIN",
        },
      });

    return NextResponse.json(
      batch,
      {
        status: 201,
      }
    );

  } catch (error) {

    console.error(
      "[CREATE_RAW_MATERIAL_MASTER_ERROR]",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create raw material batch",
      },
      {
        status: 500,
      }
    );
  }
}

