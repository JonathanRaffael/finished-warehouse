import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {

    const materials =
      await prisma.rawMaterial.findMany({
        orderBy: {
          materialName: "asc",
        },
      });

    return NextResponse.json(
      materials
    );

  } catch (error) {

    console.error(
      "[RAW_MATERIAL_MASTER_LIST_ERROR]",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch material list",
      },
      {
        status: 500,
      }
    );
  }
}