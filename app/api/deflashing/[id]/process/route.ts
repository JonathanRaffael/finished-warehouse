import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await req.json()

    const qtyOut = Number(body.qtyOut)
    const ngQty = Number(body.ngQty)
    const processedBy = body.processedBy?.trim()

    /* ================= VALIDATION ================= */

    if (isNaN(qtyOut) || isNaN(ngQty) || !processedBy) {
      return NextResponse.json(
        { message: 'Invalid or missing fields' },
        { status: 400 }
      )
    }

    const record = await prisma.deflashing.findUnique({
      where: { id }
    })

    if (!record) {
      return NextResponse.json(
        { message: 'Record not found' },
        { status: 404 }
      )
    }

    if (record.status === 'DONE') {
      return NextResponse.json(
        { message: 'Already completed' },
        { status: 400 }
      )
    }

    const processNow = qtyOut + ngQty
    const remaining = record.qtyIn - record.processedQty

    if (processNow <= 0) {
      return NextResponse.json(
        { message: 'Processing quantity must be greater than 0' },
        { status: 400 }
      )
    }

    if (processNow > remaining) {
      return NextResponse.json(
        { message: `Processing exceeds remaining (${remaining})` },
        { status: 400 }
      )
    }

    const newProcessedQty = record.processedQty + processNow
    const isFinished = newProcessedQty === record.qtyIn

    /* ================= TRANSACTION (IMPORTANT) ================= */

    const result = await prisma.$transaction(async (tx) => {

      // ✅ 1. SAVE PROCESS LOG (SELALU, termasuk parsial)
      await tx.deflashingProcessLog.create({
        data: {
          deflashingId: id,
          batchNo: record.batchNo,
          qtyOut,
          ngQty,
          spareQty: 0,
          processedBy,
          processedAt: new Date()
        }
      })

      // ✅ 2. UPDATE MAIN TABLE
      const updated = await tx.deflashing.update({
        where: { id },
        data: {
          processedQty: newProcessedQty,
          processedBy,
          status: isFinished ? 'DONE' : 'PENDING',
          completedAt: isFinished ? new Date() : null
        }
      })

      // ✅ 3. CREATE QC QUEUE (hanya jika ada OK)
      if (qtyOut > 0) {
        await tx.afterOQCTransaction.create({
          data: {
            computerCode: record.computerCode,
            partNo: record.partNo,
            productName: record.productName,
            batch: record.batchNo,

            beforeQty: qtyOut,

            afterQty: 0,
            ngQty: 0,
            spareQty: 0,

            status: 'PENDING',
            source: 'DEFLASHING',
            responsiblePerson: processedBy
          }
        })
      }

      return updated
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('[PROCESS DEFLASHING ERROR]', error)

    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}