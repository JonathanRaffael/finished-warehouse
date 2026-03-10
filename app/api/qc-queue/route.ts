import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {

  try {

    /* ================= QC FROM INCOMING ================= */

    const incoming = await prisma.incomingTransaction.findMany({

      where: {
        remainingQty: {
          gt: 0
        }
      },

      orderBy: {
        createdAt: 'asc'
      },

      select: {
        id: true,
        computerCode: true,
        partNo: true,
        productName: true,
        batch: true,
        remainingQty: true
      }

    })

    const incomingQueue = incoming.map(i => ({
      id: i.id,
      computerCode: i.computerCode,
      partNo: i.partNo,
      productName: i.productName,
      batch: i.batch ?? 0,
      beforeQty: i.remainingQty,
      afterQty: 0,
      ngQty: 0,
      spareQty: 0
    }))


    /* ================= QC FROM DEFLASHING ================= */

    const deflashingQueue = await prisma.afterOQCTransaction.findMany({

      where: {
        status: 'PENDING'
      },

      orderBy: {
        createdAt: 'asc'
      },

      select: {
        id: true,
        computerCode: true,
        partNo: true,
        productName: true,
        beforeQty: true,
        afterQty: true,
        ngQty: true,
        spareQty: true
      }

    })

    return NextResponse.json({
      incomingQueue,
      deflashingQueue
    })

  } catch (e) {

    console.error('[QC_QUEUE]', e)

    return NextResponse.json({
      incomingQueue: [],
      deflashingQueue: []
    }, { status: 500 })

  }

}