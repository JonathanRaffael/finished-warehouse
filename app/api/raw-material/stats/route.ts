import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {

  try {

    /* ================= DATE ================= */

    const today =
      new Date();

    const startOfDay =
      new Date();

    startOfDay.setHours(
      0,
      0,
      0,
      0
    );

    const endOfDay =
      new Date();

    endOfDay.setHours(
      23,
      59,
      59,
      999
    );

    const next30Days =
      new Date();

    next30Days.setDate(
      next30Days.getDate() + 30
    );

    /* ================= TOTAL MATERIAL ================= */

    const totalMaterials =
      await prisma.rawMaterial.count();

    /* ================= TOTAL BATCH ================= */

    const totalBatches =
      await prisma.rawMaterialBatch.count();

    /* ================= LOW STOCK ================= */

    const lowStock =
      await prisma.rawMaterialBatch.count({
        where: {
          balanceQty: {
            gt: 0,
            lte: 5,
          },

          expDate: {
            gt: today,
          },
        },
      });

    /* ================= EMPTY STOCK ================= */

    const emptyStock =
      await prisma.rawMaterialBatch.count({
        where: {
          balanceQty: {
            lte: 0,
          },
        },
      });

    /* ================= EXPIRED ================= */

    const expired =
      await prisma.rawMaterialBatch.count({
        where: {
          expDate: {
            lt: today,
          },
        },
      });

    /* ================= NEAR EXPIRED ================= */

    const nearExpired =
      await prisma.rawMaterialBatch.count({
        where: {
          expDate: {
            gte: today,
            lte: next30Days,
          },
        },
      });

    /* ================= INCOMING TODAY ================= */

    const incomingToday =
      await prisma.rawMaterialBatch.count({
        where: {
          incomingDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

    /* ================= USAGE TODAY ================= */

    const usageToday =
      await prisma.rawMaterialUsage.aggregate({
        where: {
          usageDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },

        _sum: {
          qtyUsed: true,
        },
      });

    return NextResponse.json({
      totalMaterials,

      totalBatches,

      lowStock,

      emptyStock,

      expired,

      nearExpired,

      incomingToday,

      totalUsageToday:
        usageToday._sum.qtyUsed || 0,
    });

  } catch (error) {

    console.error(
      "[RAW_MATERIAL_STATS_ERROR]",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch stats",
      },
      {
        status: 500,
      }
    );
  }
}