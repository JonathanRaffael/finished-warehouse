import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/* ================= GET HISTORY ================= */
export async function GET() {
  try {
    const data = await prisma.deflashing.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(data)

  } catch (error) {
    console.error('[GET DEFLASHING ERROR]', error)
    return NextResponse.json(
      { message: 'Failed to fetch deflashing history' },
      { status: 500 }
    )
  }
}

/* ================= POST ================= */
export async function POST(req: NextRequest) {
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

    if (
      !computerCode ||
      !partNo ||
      !productName ||
      !qtyIn ||
      qtyOut < 0 ||
      ngQty < 0 ||
      spareQty < 0 ||
      !responsiblePerson
    ) {
      return NextResponse.json(
        { message: 'Invalid input' },
        { status: 400 }
      )
    }

    if (qtyOut + ngQty !== qtyIn) {
      return NextResponse.json(
        { message: 'OK + NG must equal Before quantity' },
        { status: 400 }
      )
    }

    const finalStock = qtyOut + spareQty

    const deflashing = await prisma.deflashing.create({
      data: {
        computerCode: computerCode.toUpperCase(),
        partNo,
        productName,
        qtyIn,
        qtyOut,
        ngQty,
        spareQty,
        responsiblePerson,
        remark
      }
    })

    await prisma.product.update({
      where: { computerCode: computerCode.toUpperCase() },
      data: {
        initialStock: {
          increment: finalStock
        }
      }
    })

    return NextResponse.json(deflashing)

  } catch (error) {
    console.error('[DEFLASHING ERROR]', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
