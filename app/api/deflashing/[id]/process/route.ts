import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await req.json()

    const { qtyOut, ngQty, spareQty, processedBy } = body

    if (
      qtyOut == null ||
      ngQty == null ||
      spareQty == null ||
      !processedBy
    ) {
      return NextResponse.json(
        { message: 'Missing required fields' },
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
        { message: 'Processing exceeds remaining quantity' },
        { status: 400 }
      )
    }

    const newProcessedQty = record.processedQty + processNow
    const isFinished = newProcessedQty === record.qtyIn

    // 🔥 Simpan log parsial
    await prisma.deflashingProcessLog.create({
      data: {
        deflashingId: id,
        qtyOut,
        ngQty,
        spareQty,
        processedBy
      }
    })

    // 🔥 Update master
    const updated = await prisma.deflashing.update({
      where: { id },
      data: {
        processedQty: newProcessedQty,
        processedBy,
        status: isFinished ? 'DONE' : 'PENDING',
        completedAt: isFinished ? new Date() : null
      }
    })

    // 🔥 Update stock (OK + Spare masuk stock)
    await prisma.product.update({
      where: { computerCode: record.computerCode },
      data: {
        initialStock: {
          increment: qtyOut + spareQty
        }
      }
    })

    return NextResponse.json(updated)

  } catch (error) {
    console.error('[PROCESS DEFLASHING ERROR]', error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}