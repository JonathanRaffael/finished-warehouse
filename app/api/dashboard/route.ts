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

    const deflashingData = await prisma.deflashing.findMany()

    const dashboardData = products.map(product => {

      /* ================= INCOMING ================= */
      const totalIncoming = product.incomingTransactions.reduce(
        (sum, t) => sum + t.incomingQty,
        0
      )

      /* ================= AFTER OQC ================= */
      const totalAfterOQC = product.afterOQCTransactions.reduce(
        (sum, t) => sum + t.afterQty,
        0
      )

      /* ================= OUTGOING ================= */
      const totalOutgoing = product.outgoingTransactions.reduce(
        (sum, o) => sum + o.qtyOut,
        0
      )

      /* ================= DEFLASHING ================= */
      const productDeflashing = deflashingData.filter(
        d => d.computerCode === product.computerCode
      )

      const totalDeflashing = productDeflashing.length

      const totalDeflashingQty = productDeflashing.reduce(
        (sum, d) => sum + d.qtyOut + d.spareQty,
        0
      )

      const totalDeflashingNG = productDeflashing.reduce(
        (sum, d) => sum + d.ngQty,
        0
      )

      /* ================= FINAL STOCK ================= */
      const finalStock =
        product.initialStock +
        totalIncoming +
        totalAfterOQC +
        totalDeflashingQty -
        totalOutgoing

      return {
        computerCode: product.computerCode,
        partNo: product.partNo,
        productName: product.productName,
        productionType: product.productionType,
        location: product.location,

        initialStock: product.initialStock,

        totalIncoming,
        totalAfterOQC,
        totalOutgoing,

        totalDeflashing,
        totalDeflashingQty,
        totalDeflashingNG,

        finalStock
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
