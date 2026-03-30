import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {

  const incoming = await prisma.incomingTransaction.findMany({

    orderBy: {
      createdAt: 'desc'
    },

    // ✅ LANGSUNG INCLUDE RELASI
    include: {
      outHistories: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }

  })

  const result = incoming.map(tx => ({

    id: tx.id,
    date: tx.date,

    computerCode: tx.computerCode,
    partNo: tx.partNo,
    productName: tx.productName,

    incomingQty: tx.incomingQty,
    remainingQty: tx.remainingQty,

    responsiblePerson: tx.responsiblePerson,
    batch: tx.batch,
    status: tx.status,

    // ✅ FIX: pakai relasi langsung
    outgoingTransactions: tx.outHistories.map(h => ({
      id: h.id,
      qtyOut: h.qtyOut,
      createdAt: h.createdAt,
      responsiblePerson: h.responsiblePerson
    }))

  }))

  return NextResponse.json(result)

}