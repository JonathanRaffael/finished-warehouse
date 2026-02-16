import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const data = await prisma.afterOQCLog.findMany({
      include: {
        afterOQC: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(data)
  } catch (e) {
    console.error('[QC HISTORY]', e)
    return NextResponse.json([], { status: 500 })
  }
}
