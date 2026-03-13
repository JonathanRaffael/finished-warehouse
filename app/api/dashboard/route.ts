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

      /* ================= INCOMING ================= */

      const totalIncoming = product.incomingTransactions.reduce(
        (sum, t) => sum + (t.incomingQty ?? 0),
        0
      )

      /* ================= BEFORE OQC ================= */
      /* qty yang dikirim dari incoming ke QC queue */

      const beforeOQC = product.incomingTransactions.reduce(
        (sum, t) => sum + ((t.incomingQty ?? 0) - (t.remainingQty ?? 0)),
        0
      )

      /* ================= AFTER OQC ================= */

      const totalAfterOQC = product.afterOQCTransactions.reduce(
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

      const finalStock =
        product.initialStock +
        totalIncoming +
        totalAfterOQC +
        totalDeflashingQty -
        totalOutgoing

      /* ================= FINAL STOCK WAREHOUSE ================= */

      const finalStockWarehouse =
        product.initialStock +
        totalAfterOQC -
        totalOutgoing

      return {
        computerCode: product.computerCode,
        partNo: product.partNo,
        productName: product.productName,
        productionType: product.productionType,
        location: product.location,

        initialStock: product.initialStock,

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