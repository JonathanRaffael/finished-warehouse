import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/* ================= CREATE OUTGOING ================= */

export async function POST(req: NextRequest) {

  try {

    const body = await req.json()

    const {
      computerCode,
      partNo,
      productName,
      qtyOut,
      responsiblePerson,
      remark,
      date
    } = body

    /* VALIDATION */

    if (!computerCode || !qtyOut || !responsiblePerson) {

      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )

    }

    /* CREATE TRANSACTION */

    const transaction = await prisma.outgoingTransaction.create({

      data: {
        computerCode: computerCode.trim().toUpperCase(),
        partNo: partNo?.trim() || '',
        productName: productName?.trim() || '',
        qtyOut: Number(qtyOut),
        responsiblePerson: responsiblePerson.trim(),
        remark: remark?.trim() || null,
        date: date ? new Date(date) : new Date()
      }

    })

    return NextResponse.json(
      { success: true, data: transaction },
      { status: 201 }
    )

  } catch (error) {

    console.error('[OUTGOING POST]', error)

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )

  }

}

/* ================= GET OUTGOING HISTORY ================= */

export async function GET() {

  try {

    const data = await prisma.outgoingTransaction.findMany({

      orderBy: {
        createdAt: 'asc'
      }

    })

    return NextResponse.json(data)

  } catch (error) {

    console.error('[OUTGOING GET]', error)

    return NextResponse.json([], { status: 500 })

  }

}