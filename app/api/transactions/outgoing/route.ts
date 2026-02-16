import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      computerCode,
      partNo,
      productName,
      qtyOut,
      responsiblePerson,
      date
    } = body

    if (!computerCode || !qtyOut || !responsiblePerson) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    await prisma.outgoingTransaction.create({
      data: {
        computerCode: computerCode.trim().toUpperCase(),
        partNo: partNo?.trim() || '',
        productName: productName?.trim() || '',
        qtyOut: Number(qtyOut),
        responsiblePerson: responsiblePerson.trim(),
        date: date ? new Date(date) : new Date()
      }
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[OUTGOING POST]', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const data = await prisma.outgoingTransaction.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('[OUTGOING GET]', error)
    return NextResponse.json([], { status: 500 })
  }
}
