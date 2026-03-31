import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      computerCode,
      partNo,
      productName,
      productionType,
      qtyIn,
      incomingBy,
      batchNo
    } = body

    // 🔒 normalize
    const code = computerCode?.toString().trim()
    const part = partNo?.toString().trim()
    const name = productName?.toString().trim()
    const person = incomingBy?.toString().trim()
    const qty = Number(qtyIn)
    const batch = batchNo?.toString().trim() || null

    // 🔥 VALIDATION
    if (!code) {
      return NextResponse.json({ message: 'Computer Code required' }, { status: 400 })
    }

    if (!part) {
      return NextResponse.json({ message: 'Part No required' }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ message: 'Product Name required' }, { status: 400 })
    }

    if (!person) {
      return NextResponse.json({ message: 'Incoming By required' }, { status: 400 })
    }

    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({ message: 'Qty must be greater than 0' }, { status: 400 })
    }

    // 🚀 CREATE DEFLASHING (FULLY INDEPENDENT)
    const data = await prisma.deflashing.create({
      data: {
        computerCode: code,
        partNo: part,
        productName: name,
        productionType,
        qtyIn: qty,
        incomingBy: person,
        batchNo: batch,
        status: "PENDING"
      }
    })

    return NextResponse.json(data)

  } catch (error) {
    console.error('[DEFLASHING CREATE ERROR]', error)

    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}