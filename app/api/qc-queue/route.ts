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
      }
    })

    const queue = incoming.map(i => ({
      id: i.id,
      computerCode: i.computerCode,
      partNo: i.partNo,
      productName: i.productName,
      remainingQty: i.remainingQty
    }))

    return NextResponse.json(queue)

  } catch (e) {
    console.error('[QC_QUEUE]', e)
    return NextResponse.json([], { status: 500 })
  }
}
