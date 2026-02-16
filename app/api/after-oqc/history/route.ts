import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const data = await prisma.afterOQCTransaction.findMany({
      where: {
        status: 'DONE' // hanya tampil kalau sudah habis semua
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(data)
  } catch (e) {
    console.error('[AfterOQC HISTORY]', e)
    return NextResponse.json([], { status: 500 })
  }
}
