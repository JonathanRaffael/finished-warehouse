import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/* ================= GET : HISTORY ================= */
export async function GET() {
  try {
    const data = await prisma.deflashing.findMany({
      orderBy: { createdAt: 'desc' }
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
      computerCode,
      partNo,
      productName,
      qtyIn,
      qtyOut,
      ngQty,
      spareQty,
      responsiblePerson,
      remark
    } = body

    // basic validation
    if (
      !computerCode ||
      !partNo ||
      !productName ||
      !responsiblePerson
    ) {
      return new NextResponse('Invalid payload', { status: 400 })
    }

    const data = await prisma.deflashing.create({
      data: {
        computerCode,
        partNo,
        productName,
        qtyIn: Number(qtyIn) || 0,
        qtyOut: Number(qtyOut) || 0,
        ngQty: Number(ngQty) || 0,
        spareQty: Number(spareQty) || 0,
        responsiblePerson,
        remark
      }
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[DEFLASHING POST ERROR]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
