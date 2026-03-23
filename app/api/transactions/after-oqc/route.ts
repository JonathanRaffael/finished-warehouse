import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/* ================= GET : QC QUEUE ================= */

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


/* ================= POST : PROCESS QC ================= */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      id,
      computerCode,
      partNo,
      productName,
      batch,
      beforeQty,
      afterQty,
      ngQty,
      spareQty,
      responsiblePerson
    } = body

    const finalAfter = Math.max(Number(afterQty) || 0, 0)
    const finalNg = Math.max(Number(ngQty) || 0, 0)
    const finalSpare = Math.max(Number(spareQty) || 0, 0)

    let transactionId = id


    /* ================= MANUAL MODE ================= */

    if (!id) {

      const totalProcessed = finalAfter + finalNg
      const remaining = (Number(beforeQty) || 0) - totalProcessed

      const created = await prisma.afterOQCTransaction.create({
        data: {
          computerCode: String(computerCode),
          partNo: String(partNo),
          productName: String(productName),
          batch: batch ? String(batch).trim() : null,

          beforeQty: Number(beforeQty) || 0,

          afterQty: finalAfter,
          ngQty: finalNg,
          spareQty: finalSpare,

          responsiblePerson: responsiblePerson || null,

          status: remaining <= 0 ? 'DONE' : 'PENDING',

          incomingId: null
        }
      })

      transactionId = created.id

      await prisma.afterOQCLog.create({
        data: {
          afterOQCId: transactionId,
          okQty: finalAfter,
          ngQty: finalNg,
          spareQty: finalSpare,
          responsiblePerson
        }
      })

      return NextResponse.json({
        success: true,
        manual: true,
        remaining
      })
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


    /* ================= CALCULATE (FINAL MODE) ================= */

    const totalProcessed = finalAfter + finalNg
    const remaining = existing.beforeQty - totalProcessed

    const status = remaining <= 0 ? 'DONE' : 'PENDING'


    /* ================= SAVE LOG ================= */

    await prisma.afterOQCLog.create({
      data: {
        afterOQCId: id,
        okQty: finalAfter,
        ngQty: finalNg,
        spareQty: finalSpare,
        responsiblePerson
      }
    })


    /* ================= UPDATE TRANSACTION ================= */

    await prisma.afterOQCTransaction.update({
      where: { id },
      data: {
        // ❗ beforeQty tetap sebagai qty awal (JANGAN diubah-ubah lagi)
        afterQty: finalAfter,
        ngQty: finalNg,
        spareQty: finalSpare,

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