import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {

  try {

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
        batch: true,        // 🔥 WAJIB ADA
        remainingQty: true
      }

    })

    const queue = incoming.map(i => ({

      id: i.id,
      computerCode: i.computerCode,
      partNo: i.partNo,
      productName: i.productName,

      batch: i.batch ?? 0, // 🔥 ini yang akan tampil di tabel

      beforeQty: i.remainingQty,
      afterQty: 0,
      ngQty: 0,
      spareQty: 0

    }))

    return NextResponse.json(queue)

  } catch (e) {

    console.error('[QC_QUEUE]', e)

    return NextResponse.json([], { status: 500 })

  }

}