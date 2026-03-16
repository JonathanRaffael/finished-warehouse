import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {

  try {

    const body = await req.json()

    const {
      computerCode,
      partNo,
      productName,
      qtyOut,
      responsiblePerson,
      remark
    } = body

    /* VALIDATION */

    if (!computerCode || !responsiblePerson) {
      return NextResponse.json(
        { error: 'Computer code and responsible person are required' },
        { status: 400 }
      )
    }

    if (!qtyOut || Number(qtyOut) <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      )
    }

    /* CREATE TRANSACTION */

    const transaction = await prisma.outgoingTransaction.create({
      data: {
        computerCode: computerCode.trim(),
        partNo: partNo?.trim() || null,
        productName: productName?.trim() || null,
        qtyOut: Number(qtyOut),
        responsiblePerson: responsiblePerson.trim(),
        remark: remark?.trim() || null
      }
    })

    return NextResponse.json({
      success: true,
      data: transaction
    })

  } catch (error) {

    console.error('[OUTGOING TRANSACTION ERROR]', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )

  }

}