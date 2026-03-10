import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/* ================= GET : HISTORY ================= */

export async function GET() {
  try {

    const data = await prisma.deflashing.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,

        incomingId: true, // 🔥 penting untuk debug

        computerCode: true,
        partNo: true,
        productName: true,

        productionType: true,

        qtyIn: true,
        processedQty: true,

        status: true,

        incomingBy: true,
        processedBy: true,

        batchNo: true,

        createdAt: true,
        completedAt: true
      }
    })

    return NextResponse.json(data)

  } catch (error) {

    console.error('[DEFLASHING GET ERROR]', error)

    return new NextResponse('Internal Server Error', { status: 500 })

  }
}


/* ================= POST : CREATE ================= */

export async function POST(req: Request) {

  try {

    const body = await req.json()

    const {
      incomingId,   // 🔥 WAJIB
      computerCode,
      partNo,
      productName,
      processType,
      qtyIn,
      batchNo,
      incomingBy
    } = body

    /* ================= VALIDATION ================= */

    if (
      !incomingId ||
      !computerCode ||
      !partNo ||
      !productName ||
      !processType ||
      !incomingBy
    ) {
      return new NextResponse('Invalid payload', { status: 400 })
    }

    /* ================= CREATE ================= */

    const data = await prisma.deflashing.create({

      data: {

        incomingId, // 🔥 SIMPAN RELASI

        computerCode,
        partNo,
        productName,

        productionType: processType,

        qtyIn: Number(qtyIn) || 0,

        batchNo: Number(batchNo) || 0,

        incomingBy

      }

    })

    return NextResponse.json(data, { status: 201 })

  } catch (error) {

    console.error('[DEFLASHING POST ERROR]', error)

    return new NextResponse('Internal Server Error', { status: 500 })

  }

}