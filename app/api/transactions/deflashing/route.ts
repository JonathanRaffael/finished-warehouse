import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/* ================= GET : HISTORY ================= */
export async function GET() {
  try {
    const data = await prisma.deflashing.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        date: true,
        computerCode: true,
        partNo: true,
        productName: true,
        productionType: true, // ✅ INCLUDE HK / HT
        qtyIn: true,
        qtyOut: true,
        ngQty: true,
        spareQty: true,
        responsiblePerson: true,
        remark: true,
        createdAt: true
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
      computerCode,
      partNo,
      productName,
      processType, // ✅ dari frontend
      qtyIn,
      qtyOut,
      ngQty,
      spareQty,
      responsiblePerson,
      remark
    } = body

    /* ================= VALIDATION ================= */
    if (
      !computerCode ||
      !partNo ||
      !productName ||
      !processType || // ✅ wajib HK / HT
      !responsiblePerson
    ) {
      return new NextResponse('Invalid payload', { status: 400 })
    }

    /* ================= CREATE ================= */
    const data = await prisma.deflashing.create({
      data: {
        computerCode,
        partNo,
        productName,

        // 🔥 mapping frontend -> database enum
        productionType: processType,

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
