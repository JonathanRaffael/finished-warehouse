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
    const processedBy = body.processedBy

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

    /* ================= SAVE PROCESS LOG ================= */

    await prisma.deflashingProcessLog.create({
      data: {
        deflashingId: id,
        batchNo: record.batchNo,
        qtyOut,
        ngQty,
        spareQty: 0,
        processedBy
      }
    })

    /* ================= UPDATE DEFLASHING ================= */

    const updated = await prisma.deflashing.update({
      where: { id },
      data: {
        processedQty: newProcessedQty,
        processedBy,
        status: isFinished ? 'DONE' : 'PENDING',
        completedAt: isFinished ? new Date() : null
      }
    })

    /* ================= CREATE QC QUEUE ================= */

if (qtyOut > 0) {
  await prisma.afterOQCTransaction.create({
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

    return NextResponse.json(updated)

  } catch (error) {
    console.error('[PROCESS DEFLASHING ERROR]', error)

    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}