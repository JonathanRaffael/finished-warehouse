import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {

  try {

    /* ================= QC QUEUE FROM INCOMING ================= */

    const incomingQC = await prisma.afterOQCTransaction.findMany({

      where: {
        status: 'PENDING',
        source: 'INCOMING'
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
        batch: true        // ✅ TAMBAHKAN
      }

    })

    const incomingQueue = incomingQC.map((q) => ({
      id: q.id,
      computerCode: q.computerCode,
      partNo: q.partNo,
      productName: q.productName,
      batch: q.batch,      // ✅ GUNAKAN NILAI DARI DB
      beforeQty: q.beforeQty,
      afterQty: 0,
      ngQty: 0,
      spareQty: 0
    }))


    /* ================= QC QUEUE FROM DEFLASHING ================= */

    const deflashingQC = await prisma.afterOQCTransaction.findMany({

      where: {
        status: 'PENDING',
        source: 'DEFLASHING'
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
        batch: true        // ✅ TAMBAHKAN
      }

    })

    const deflashingQueue = deflashingQC.map((d) => ({
      id: d.id,
      computerCode: d.computerCode,
      partNo: d.partNo,
      productName: d.productName,
      batch: d.batch,      // ✅ GUNAKAN NILAI DARI DB
      beforeQty: d.beforeQty,
      afterQty: 0,
      ngQty: 0,
      spareQty: 0
    }))


    return NextResponse.json({
      incomingQueue,
      deflashingQueue
    })

  } catch (error) {

    console.error('[QC_QUEUE_ERROR]', error)

    return NextResponse.json(
      {
        incomingQueue: [],
        deflashingQueue: []
      },
      { status: 500 }
    )

  }

}