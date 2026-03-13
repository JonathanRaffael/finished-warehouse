import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {

  try {

    const { id } = await context.params

    const body = await req.json()
    const { incomingQty, batch } = body

    const current = await prisma.incomingTransaction.findUnique({
      where: { id }
    })

    if (!current) {
      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      )
    }

    const totalOutgoing = current.outgoingQty ?? 0
    const newIncomingQty = Number(incomingQty)

    if (newIncomingQty < totalOutgoing) {
      return NextResponse.json(
        { message: 'Incoming qty cannot be less than outgoing qty' },
        { status: 400 }
      )
    }

    const newRemainingQty = newIncomingQty - totalOutgoing

    const updated = await prisma.incomingTransaction.update({
      where: { id },
      data: {
        incomingQty: newIncomingQty,
        remainingQty: newRemainingQty,
        batch: String(batch)
      }
    })

    return NextResponse.json({
      success: true,
      data: updated
    })

  } catch (error) {

    console.error('[UPDATE INCOMING]', error)

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )

  }

}