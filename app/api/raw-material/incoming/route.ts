// app/api/raw-material/incoming/route.ts

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest
) {

  try {

    const body =
      await request.json();

    const {
      rawMaterialId,

      incomingDate,

      lotNo,

      incomingQty,

      incomingWeight,

      spq,

      warehouse,

      expDate,

      createdBy,
    } = body;

    /* ================= VALIDATION ================= */

    if (
      !rawMaterialId ||
      !incomingDate ||
      !lotNo ||
      !incomingQty ||
      !incomingWeight ||
      !spq ||
      !warehouse ||
      !expDate ||
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

    /* ================= CHECK MATERIAL ================= */

    const material =
      await prisma.rawMaterial.findUnique({
        where: {
          id: rawMaterialId,
        },
      });

    if (!material) {

      return NextResponse.json(
        {
          message:
            "Raw material not found",
        },
        {
          status: 404,
        }
      );
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
          message:
            "Lot number already exists",
        },
        {
          status: 400,
        }
      );
    }

    /* ================= AUTO STATUS ================= */

    const today =
      new Date();

    const status =
      new Date(expDate) < today
        ? "EXPIRED"
        : "ACTIVE";

    /* ================= CREATE BATCH ================= */

    const incoming =
      await prisma.rawMaterialBatch.create({
        data: {
          rawMaterialId,

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

          createdBy,

          status,
        },
      });

    return NextResponse.json(
      {
        message:
          "Raw material incoming created successfully",

        data: incoming,
      },
      {
        status: 201,
      }
    );

  } catch (error) {

    console.error(
      "[RAW_MATERIAL_INCOMING_CREATE_ERROR]",
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

