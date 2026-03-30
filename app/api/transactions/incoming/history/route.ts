import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {

  try {

    const data = await prisma.incomingTransaction.findMany({

      where: {
        status: {
          not: 'OPEN'
        }
      },

      orderBy: {
        createdAt: 'desc'
      },

      include: {
        // ✅ WAJIB
        outHistories: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }

    })

    const result = data.map(tx => ({

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

      // ✅ FIX DI SINI
      outHistories: tx.outHistories.map(h => ({
        id: h.id,
        qtyOut: h.qtyOut,
        createdAt: h.createdAt,
        responsiblePerson: h.responsiblePerson
      }))

    }))

    return NextResponse.json(result)

  } catch (error) {

    console.error('[INCOMING HISTORY]', error)

    return NextResponse.json([], { status: 500 })

  }

}