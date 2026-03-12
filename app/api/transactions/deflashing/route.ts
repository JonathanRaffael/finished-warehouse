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

        incomingId: true,

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

    return new NextResponse(
      'Internal Server Error',
      { status: 500 }
    )

  }

}


/* ================= POST : CREATE ================= */

export async function POST(req: Request) {

  try {

    const body = await req.json()

    const {

      incomingId,
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

      return new NextResponse(
        'Invalid payload',
        { status: 400 }
      )

    }

    if (!qtyIn || Number(qtyIn) <= 0) {

      return new NextResponse(
        'Invalid quantity',
        { status: 400 }
      )

    }

    /* ================= CREATE ================= */

    const data = await prisma.deflashing.create({

      data: {

        incomingId,

        computerCode,
        partNo,
        productName,

        productionType: processType,

        qtyIn: Number(qtyIn),

        // batch tidak dipaksa 0 agar tidak hilang di UI
        batchNo: batchNo ? Number(batchNo) : null,

        incomingBy

      }

    })

    return NextResponse.json(
      data,
      { status: 201 }
    )

  } catch (error) {

    console.error('[DEFLASHING POST ERROR]', error)

    return new NextResponse(
      'Internal Server Error',
      { status: 500 }
    )

  }

}