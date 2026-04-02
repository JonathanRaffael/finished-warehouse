import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {

    const data = await prisma.afterOQCLog.findMany({

      include: {
        afterOQC: {
          select: {
            id: true,
            computerCode: true,
            partNo: true,
            productName: true,
            batch: true,
            source: true,
            incoming: {
              select: {
                batch: true
              }
            }
          }
        }
      },

      orderBy: {
        createdAt: 'desc'
      }

    })

    // 🔥 FIX: normalize source
    const normalized = data.map((item) => ({
      ...item,
      source: (item.afterOQC?.source || 'INCOMING').toUpperCase()
    }))

    return NextResponse.json(normalized)

  } catch (e) {

    console.error('[QC HISTORY]', e)
    return NextResponse.json([], { status: 500 })

  }
}