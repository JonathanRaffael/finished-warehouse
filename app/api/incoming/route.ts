import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {

  const incoming = await prisma.incomingTransaction.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  const result = await Promise.all(

    incoming.map(async (tx) => {

      const outgoingHistory = await prisma.outgoingTransaction.findMany({
        where: {
          computerCode: tx.computerCode,
          partNo: tx.partNo
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return {

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

        outgoingTransactions: outgoingHistory.map(o => ({
          id: o.id,
          qtyOut: o.qtyOut,
          createdAt: o.createdAt,
          responsiblePerson: o.responsiblePerson
        }))

      }

    })

  )

  return NextResponse.json(result)

}