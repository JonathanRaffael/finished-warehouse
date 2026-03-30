import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { incomingId, qty, responsiblePerson } = body

    if (!incomingId || !qty || qty <= 0) {
      return NextResponse.json(
        { message: 'Invalid payload' },
        { status: 400 }
      )
    }

    /* ================= GET INCOMING ================= */

    const incoming = await prisma.incomingTransaction.findUnique({
      where: { id: incomingId }
    })

    if (!incoming) throw new Error('Incoming not found')
    if (!incoming.remainingQty || incoming.remainingQty <= 0)
      throw new Error('No remaining stock')
    if (qty > incoming.remainingQty)
      throw new Error('Qty melebihi remaining incoming')

    /* ================= ANTI DOUBLE QC ================= */

    const existingPending = await prisma.afterOQCTransaction.findFirst({
      where: {
        incomingId,
        status: 'PENDING'
      }
    })

    if (existingPending) {
      throw new Error('Masih ada QC yang belum selesai')
    }

    /* ================= CREATE QC ================= */

    const afterOQC = await prisma.afterOQCTransaction.create({
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

    /* ================= ✅ CREATE HISTORY ================= */

    await prisma.incomingOutHistory.create({
      data: {
        incomingId,
        qtyOut: qty,
        responsiblePerson
      }
    })

    /* ================= LOG ================= */

    await prisma.afterOQCLog.create({
      data: {
        afterOQCId: afterOQC.id,
        okQty: 0,
        ngQty: 0,
        spareQty: 0,
        responsiblePerson
      }
    })

    /* ================= UPDATE INCOMING ================= */

    const newRemaining = incoming.remainingQty - qty

    await prisma.incomingTransaction.update({
      where: { id: incomingId },
      data: {
        remainingQty: newRemaining,
        status: newRemaining === 0 ? 'CLOSED' : 'OPEN'
      }
    })

    return NextResponse.json({
      success: true,
      data: afterOQC
    })

  } catch (e: any) {

    console.error('[QC CREATE]', e)

    return NextResponse.json(
      { message: e.message || 'Server error' },
      { status: 500 }
    )
  }
}