import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {

  try {

    const session = request.cookies.get('session')
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      include: {
        incomingTransactions: true,
        afterOQCTransactions: true,
        outgoingTransactions: true
      },
      orderBy: {
        computerCode: 'asc'
      }
    })

    /* ================= DEFLASHING LOGS ================= */

    const deflashingLogs = await prisma.deflashingProcessLog.findMany({
      include: {
        deflashing: true
      }
    })

    const dashboardData = products.map(product => {

      /* ================= INCOMING (SISA REAL) ================= */

      const totalIncoming = product.incomingTransactions.reduce(
        (sum, t) => sum + (t.remainingQty ?? 0),
        0
      )

      /* ================= GROUP OQC ================= */

      const pendingOQC = product.afterOQCTransactions.filter(
        t => t.status === 'PENDING'
      )

      const doneOQC = product.afterOQCTransactions.filter(
        t => t.status === 'DONE'
      )

      /* ================= BEFORE OQC ================= */

      const beforeOQC = pendingOQC.reduce(
        (sum, t) => sum + (t.beforeQty ?? 0),
        0
      )

      /* ================= AFTER OQC ================= */

      const totalAfterOQC = doneOQC.reduce(
        (sum, t) => sum + (t.afterQty ?? 0) + (t.spareQty ?? 0),
        0
      )

      /* ================= OUTGOING ================= */

      const totalOutgoing = product.outgoingTransactions.reduce(
        (sum, o) => sum + (o.qtyOut ?? 0),
        0
      )

      /* ================= DEFLASHING ================= */

      const productLogs = deflashingLogs.filter(
        log => log.deflashing.computerCode === product.computerCode
      )

      const totalDeflashingQty = productLogs.reduce(
        (sum, log) => sum + (log.qtyOut ?? 0),
        0
      )

      const totalDeflashingNG = productLogs.reduce(
        (sum, log) => sum + (log.ngQty ?? 0),
        0
      )

      /* ================= FINAL STOCK ================= */
      // sesuai rumus:
      // initial + incoming + before + after - outgoing

      const finalStock =
        (product.initialStock ?? 0) +
        (totalIncoming ?? 0) +
        (beforeOQC ?? 0) +
        (totalAfterOQC ?? 0) -
        (totalOutgoing ?? 0)

      /* ================= FINAL STOCK WAREHOUSE ================= */
      // initial + after - outgoing

      const finalStockWarehouse =
        (product.initialStock ?? 0) +
        (totalAfterOQC ?? 0) -
        (totalOutgoing ?? 0)

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

        totalDeflashingQty,
        totalDeflashingNG,

        finalStock,
        finalStockWarehouse
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