import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { incomingId, qty, responsiblePerson } = body

    if (!incomingId || !qty || qty <= 0) {
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 })
    }

    // ambil incoming
    const incoming = await prisma.incomingTransaction.findUnique({
      where: { id: incomingId }
    })

    if (!incoming) {
      return NextResponse.json({ message: 'Incoming not found' }, { status: 404 })
    }

    if (!incoming.remainingQty || incoming.remainingQty < qty) {
      return NextResponse.json({ message: 'Qty exceeds remaining' }, { status: 400 })
    }

    // cari existing QC
    let afterOQC = await prisma.afterOQCTransaction.findFirst({
      where: {
        incomingId
      }
    })

    // kalau belum ada QC record → create
    if (!afterOQC) {
      afterOQC = await prisma.afterOQCTransaction.create({
        data: {
          incomingId,
          computerCode: incoming.computerCode,
          partNo: incoming.partNo,
          productName: incoming.productName,
          beforeQty: qty,
          responsiblePerson
        }
      })
    } else {
      // kalau sudah ada → tambah beforeQty
      await prisma.afterOQCTransaction.update({
        where: { id: afterOQC.id },
        data: {
          beforeQty: afterOQC.beforeQty + qty
        }
      })
    }

    // insert QC LOG (batch)
    await prisma.afterOQCLog.create({
      data: {
        afterOQCId: afterOQC.id,
        okQty: 0,
        ngQty: 0,
        spareQty: 0,
        responsiblePerson
      }
    })

    // update incoming remaining
    const newRemaining = incoming.remainingQty - qty

    await prisma.incomingTransaction.update({
      where: { id: incomingId },
      data: {
        remainingQty: newRemaining,
        status: newRemaining === 0 ? 'CLOSED' : 'OPEN'
      }
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[QC CREATE]', e)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
