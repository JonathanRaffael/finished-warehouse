import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {

    const data = await prisma.afterOQCTransaction.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(data)

  } catch {

    return NextResponse.json([], { status: 500 })

  }
}

export async function POST(req: NextRequest) {

  try {

    const body = await req.json()

    const {
      id,
      computerCode,
      partNo,
      productName,
      beforeQty,
      afterQty,
      ngQty,
      spareQty,
      responsiblePerson
    } = body

    const addAfter = Math.max(Number(afterQty) || 0, 0)
    const addNg = Math.max(Number(ngQty) || 0, 0)
    const addSpare = Math.max(Number(spareQty) || 0, 0)

    let transactionId = id

    /* ================= MANUAL MODE ================= */

    if (!id) {

      const created = await prisma.afterOQCTransaction.create({
  data: {
    computerCode: String(computerCode),
    partNo: String(partNo),
    productName: String(productName),
    beforeQty: Number(beforeQty),

    afterQty: addAfter,
    ngQty: addNg,
    spareQty: addSpare,

    responsiblePerson: responsiblePerson || null,

    status: 'DONE',

    incomingId: null
  } as any
})
      transactionId = created.id

      await prisma.afterOQCLog.create({
        data: {
          afterOQCId: transactionId,
          okQty: addAfter,
          ngQty: addNg,
          spareQty: addSpare,
          responsiblePerson
        }
      })

      return NextResponse.json({ success: true, manual: true })

    }

    /* ================= QUEUE MODE ================= */

    const existing = await prisma.afterOQCTransaction.findUnique({
      where: { id }
    })

    if (!existing) {

      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      )

    }

    // simpan log QC batch
    await prisma.afterOQCLog.create({
      data: {
        afterOQCId: id,
        okQty: addAfter,
        ngQty: addNg,
        spareQty: addSpare,
        responsiblePerson
      }
    })

    // update summary QC
    const totalAfter = existing.afterQty + addAfter
    const totalNg = existing.ngQty + addNg
    const totalSpare = existing.spareQty + addSpare

    const checked = totalAfter + totalNg
    const remaining = existing.beforeQty - checked

    const status = remaining <= 0 ? 'DONE' : 'PENDING'

    await prisma.afterOQCTransaction.update({
      where: { id },
      data: {
        afterQty: totalAfter,
        ngQty: totalNg,
        spareQty: totalSpare,
        responsiblePerson,
        status
      }
    })

    return NextResponse.json({
      success: true,
      remaining,
      status
    })

  } catch (error) {

    console.error('[After OQC POST]', error)

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )

  }

}