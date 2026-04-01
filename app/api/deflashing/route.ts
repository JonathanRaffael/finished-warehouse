import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/* ================= GET (QUEUE + HISTORY) ================= */
export async function GET() {
  try {

    // 🔹 QUEUE (tetap sama)
    const pending = await prisma.deflashing.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' }
    })

    // 🔥 HISTORY (UBAH TOTAL)
    const done = await prisma.deflashingProcessLog.findMany({
      orderBy: {
        processedAt: 'desc'
      },
      include: {
        deflashing: {
          select: {
            computerCode: true,
            partNo: true,
            productName: true,
            batchNo: true,
            qtyIn: true
          }
        }
      }
    })

    return NextResponse.json({
      pending,
      done
    })

  } catch (error) {
    console.error('[GET DEFLASHING ERROR]', error)

    return NextResponse.json(
      { message: 'Failed to fetch deflashing data' },
      { status: 500 }
    )
  }
}