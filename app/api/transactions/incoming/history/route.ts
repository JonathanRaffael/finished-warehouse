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
        afterOQC: {
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

      // history parsial release QC
      outgoingTransactions: tx.afterOQC.map(o => ({

        id: o.id,
        qtyOut: o.beforeQty,   // ✅ FIX
        createdAt: o.createdAt,
        responsiblePerson: o.responsiblePerson

      }))

    }))

    return NextResponse.json(result)

  } catch (error) {

    console.error('[INCOMING HISTORY]', error)

    return NextResponse.json([], { status: 500 })

  }

}