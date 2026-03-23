import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { incomingId, qty, responsiblePerson } = body

    if (!incomingId || !qty || qty <= 0) {
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {

      const incoming = await tx.incomingTransaction.findUnique({
        where: { id: incomingId }
      })

      if (!incoming) {
        throw new Error('Incoming not found')
      }

      if (!incoming.remainingQty || incoming.remainingQty < qty) {
        throw new Error('Qty exceeds remaining')
      }

      // 🔒 ANTI DOUBLE CLICK
      const existingQC = await tx.afterOQCTransaction.findFirst({
        where: {
          incomingId,
          beforeQty: qty,
          status: 'PENDING'
        }
      })

      if (existingQC) {
        throw new Error('QC already exists')
      }

      const afterOQC = await tx.afterOQCTransaction.create({
        data: {
          incomingId,
          computerCode: incoming.computerCode,
          partNo: incoming.partNo,
          productName: incoming.productName,
          batch: incoming.batch,

          beforeQty: qty,

          afterQty: 0,
          ngQty: 0,
          spareQty: 0,

          responsiblePerson,
          source: 'INCOMING',
          status: 'PENDING'
        }
      })

      await tx.afterOQCLog.create({
        data: {
          afterOQCId: afterOQC.id,
          okQty: 0,
          ngQty: 0,
          spareQty: 0,
          responsiblePerson
        }
      })

      const newRemaining = incoming.remainingQty - qty

      await tx.incomingTransaction.update({
        where: { id: incomingId },
        data: {
          remainingQty: newRemaining,
          status: newRemaining === 0 ? 'CLOSED' : 'OPEN'
        }
      })

      return afterOQC
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (e: any) {

    console.error('[QC CREATE]', e)

    return NextResponse.json(
      { message: e.message || 'Server error' },
      { status: 500 }
    )
  }
}