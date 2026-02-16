import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { computerCode, partNo, productName, qtyOut, responsiblePerson } = body

    if (!computerCode || !qtyOut || !responsiblePerson) {
      return NextResponse.json(
        { error: 'Missing data' },
        { status: 400 }
      )
    }

    await prisma.outgoingTransaction.create({
      data: {
        computerCode,
        partNo,
        productName,
        qtyOut: Number(qtyOut),
        responsiblePerson
      }
    })

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('[OUTGOING ERROR]', err)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
