import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    /*
     * Ambil Products + Deflashing Logs secara paralel.
     * Sebelumnya query dilakukan satu per satu.
     */
    const [products, deflashingLogs] = await Promise.all([
      prisma.product.findMany({
        select: {
          computerCode: true,
          partNo: true,
          productName: true,
          productionType: true,
          location: true,
          initialStock: true,

          incomingTransactions: {
            select: {
              remainingQty: true,
            },
          },

          afterOQCTransactions: {
            select: {
              status: true,
              beforeQty: true,
              afterQty: true,
              bufferQty: true,
            },
          },

          outgoingTransactions: {
            select: {
              qtyOut: true,
            },
          },
        },

        orderBy: {
          computerCode: 'asc',
        },
      }),

      prisma.deflashingProcessLog.findMany({
        select: {
          qtyOut: true,
          ngQty: true,

          deflashing: {
            select: {
              computerCode: true,
            },
          },
        },
      }),
    ])

    /* ================= DEFLASHING MAP ================= */

    /**
     * Daripada melakukan filter seluruh log
     * untuk setiap product, kita kelompokkan sekali
     * berdasarkan computerCode.
     */
    const deflashingMap = new Map<
      string,
      {
        totalQty: number
        totalNG: number
      }
    >()

    for (const log of deflashingLogs) {
      const computerCode = log.deflashing?.computerCode

      if (!computerCode) continue

      const current = deflashingMap.get(computerCode) ?? {
        totalQty: 0,
        totalNG: 0,
      }

      current.totalQty += log.qtyOut ?? 0
      current.totalNG += log.ngQty ?? 0

      deflashingMap.set(computerCode, current)
    }

    /* ================= DASHBOARD ================= */

    const dashboardData = products.map((product) => {
      /* ================= INCOMING ================= */

      const totalIncoming =
        product.incomingTransactions.reduce(
          (sum, transaction) =>
            sum + (transaction.remainingQty ?? 0),
          0
        )

      /* ================= OQC ================= */

      const pendingOQC =
        product.afterOQCTransactions.filter(
          (transaction) =>
            transaction.status === 'PENDING'
        )

      /* ================= BEFORE OQC ================= */

      const beforeOQC =
        pendingOQC.reduce(
          (sum, transaction) =>
            sum + (transaction.beforeQty ?? 0),
          0
        )

      /* ================= AFTER OQC ================= */

      const totalAfterOQC =
        product.afterOQCTransactions.reduce(
          (sum, transaction) => {
            const after =
              transaction.afterQty ?? 0

            const spare =
              transaction.bufferQty ?? 0

            if (after === 0 && spare === 0) {
              return sum
            }

            return sum + after + spare
          },
          0
        )

      /* ================= OUTGOING ================= */

      const totalOutgoing =
        product.outgoingTransactions.reduce(
          (sum, transaction) =>
            sum + (transaction.qtyOut ?? 0),
          0
        )

      /* ================= DEFLASHING ================= */

      const deflashing =
        deflashingMap.get(product.computerCode) ?? {
          totalQty: 0,
          totalNG: 0,
        }

      /* ================= FINAL STOCK ================= */

      const finalStock =
        (product.initialStock ?? 0) +
        totalIncoming +
        beforeOQC +
        totalAfterOQC -
        totalOutgoing

      /* ================= WAREHOUSE STOCK ================= */

      const finalStockWarehouse =
        (product.initialStock ?? 0) +
        totalAfterOQC -
        totalOutgoing

      return {
        computerCode: product.computerCode,
        partNo: product.partNo,
        productName: product.productName,
        productionType: product.productionType,
        location: product.location,

        initialStock: product.initialStock ?? 0,

        totalIncoming,
        beforeOQC,
        totalAfterOQC,
        totalOutgoing,

        totalDeflashingQty: deflashing.totalQty,
        totalDeflashingNG: deflashing.totalNG,

        finalStock,
        finalStockWarehouse,
      }
    })

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('[Dashboard API]', error)

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}