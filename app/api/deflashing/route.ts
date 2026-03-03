import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/* ================= GET (QUEUE + HISTORY) ================= */
export async function GET() {
  try {

    // 🔹 Queue
    const pending = await prisma.deflashing.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: {
        incoming: {
          select: {
            batch: true
          }
        }
      }
    })

    // 🔹 History
    const done = await prisma.deflashing.findMany({
      where: { status: 'DONE' },
      orderBy: { completedAt: 'desc' },
      include: {
        incoming: {
          select: {
            batch: true
          }
        },
        logs: {
          orderBy: {
            processedAt: 'asc'
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