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
      afterQty,
      ngQty,
      spareQty,
      responsiblePerson
    } = body

    if (!id) {
      return NextResponse.json({ message: 'Missing id' }, { status: 400 })
    }

    const existing = await prisma.afterOQCTransaction.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 })
    }

    const addAfter = Math.max(Number(afterQty) || 0, 0)
    const addNg = Math.max(Number(ngQty) || 0, 0)
    const addSpare = Math.max(Number(spareQty) || 0, 0)

    // 1️⃣ SIMPAN QC LOG (per batch)
    await prisma.afterOQCLog.create({
      data: {
        afterOQCId: id,
        okQty: addAfter,
        ngQty: addNg,
        spareQty: addSpare,
        responsiblePerson
      }
    })

    // 2️⃣ UPDATE SUMMARY QC MASTER
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

    return NextResponse.json({ success: true, remaining, status })
  } catch (error) {
    console.error('[After OQC POST]', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
