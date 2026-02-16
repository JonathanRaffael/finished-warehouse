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

    return NextResponse.json(data)
  } catch (error) {
    console.error('[INCOMING HISTORY]', error)
    return NextResponse.json([], { status: 500 })
  }
}
