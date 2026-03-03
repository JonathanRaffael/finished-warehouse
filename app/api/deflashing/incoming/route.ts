import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      computerCode,
      partNo,
      productName,
      productionType,
      qtyIn,
      incomingBy,
      batchNo
    } = body

    if (!computerCode || !partNo || !productName || qtyIn <= 0 || !incomingBy) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const data = await prisma.deflashing.create({
      data: {
        computerCode,
        partNo,
        productName,
        productionType,
        qtyIn: Number(qtyIn),
        incomingBy,
        batchNo: batchNo ? Number(batchNo) : null, // 🔥 SIMPAN BATCH
        status: 'PENDING'
      }
    })

    return NextResponse.json(data)

  } catch (error) {
    console.error('[DEFLASHING CREATE ERROR]', error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}