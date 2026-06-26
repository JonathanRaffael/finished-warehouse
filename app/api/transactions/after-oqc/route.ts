import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/* ================= GET : QC QUEUE ================= */

export async function GET() {
  try {
    const data = await prisma.afterOQCTransaction.findMany({
      where: {
        status: 'PENDING'
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(data)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}

/* ================= POST : PROCESS QC ================= */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    let source: 'INCOMING' | 'DEFLASHING' = 'INCOMING'

    const {
      id,
      computerCode,
      partNo,
      productName,
      batch,
      beforeQty,
      afterQty,
      ngQty,
      looseQty,
      spareQty,
      otherQty,
      responsiblePerson
    } = body

    const finalAfter = Math.max(Number(afterQty) || 0, 0)
    const finalNg = Math.max(Number(ngQty) || 0, 0)
    const finalLoose = Math.max(Number(looseQty) || 0, 0)
    const finalSpare = Math.max(Number(spareQty) || 0, 0)
    const finalOther = Math.max(Number(otherQty) || 0, 0)

    let transactionId = id

    /* ================= MANUAL MODE ================= */

    if (!id) {
      source = 'INCOMING'

      const processedQty =
        finalAfter +
        finalNg +
        finalLoose +
        finalSpare +
        finalOther

      const remaining =
        (Number(beforeQty) || 0) - processedQty

      const safeRemaining = Math.max(remaining, 0)

      const created = await prisma.afterOQCTransaction.create({
        data: {
          computerCode: String(computerCode),
          partNo: String(partNo),
          productName: String(productName),
          batch: batch ? String(batch).trim() : null,

          beforeQty: safeRemaining,

          afterQty: finalAfter,
          ngQty: finalNg,
          looseQty: finalLoose,
          spareQty: finalSpare,
          otherQty: finalOther,

          responsiblePerson: responsiblePerson || null,

          status:
            safeRemaining <= 0
              ? 'DONE'
              : 'PENDING',

          incomingId: null,

          source
        }
      })

      transactionId = created.id

      await prisma.afterOQCLog.create({
        data: {
          afterOQCId: transactionId,
          okQty: finalAfter,
          ngQty: finalNg,
          looseQty: finalLoose,
          spareQty: finalSpare,
          otherQty: finalOther,
          responsiblePerson
        }
      })

      return NextResponse.json({
        success: true,
        manual: true,
        remaining: safeRemaining
      })
    }

    /* ================= QUEUE MODE ================= */

    const existing = await prisma.afterOQCTransaction.findUnique({
      where: {
        id
      }
    })

    if (!existing) {
      return NextResponse.json(
        {
          message: 'Transaction not found'
        },
        {
          status: 404
        }
      )
    }

    if (existing.incomingId) {
      source = 'INCOMING'
    } else {
      source = 'DEFLASHING'
    }

    const processedQty =
      finalAfter +
      finalNg +
      finalLoose +
      finalSpare

    if (processedQty > existing.beforeQty) {
      return NextResponse.json(
        {
          message: 'Process qty exceeds remaining'
        },
        {
          status: 400
        }
      )
    }

    const remaining =
      existing.beforeQty - processedQty

    const safeRemaining = Math.max(remaining, 0)

    const status =
      safeRemaining <= 0
        ? 'DONE'
        : 'PENDING'

    /* ================= SAVE LOG ================= */

    await prisma.afterOQCLog.create({
      data: {
        afterOQCId: id,
        okQty: finalAfter,
        ngQty: finalNg,
        looseQty: finalLoose,
        spareQty: finalSpare,
        otherQty: finalOther,
        responsiblePerson
      }
    })

    /* ================= UPDATE TRANSACTION ================= */

    await prisma.afterOQCTransaction.update({
      where: {
        id
      },
      data: {
        beforeQty: safeRemaining,

        afterQty: {
          increment: finalAfter
        },

        ngQty: {
          increment: finalNg
        },

        looseQty: {
          increment: finalLoose
        },

        spareQty: {
          increment: finalSpare
        },

        otherQty:{
          increment: finalOther
        },

        responsiblePerson,
        status,
        source
      }
    })

    return NextResponse.json({
      success: true,
      remaining: safeRemaining,
      status
    })
  } catch (error) {
    console.error('[After OQC POST]', error)

    return NextResponse.json(
      {
        message: 'Internal server error'
      },
      {
        status: 500
      }
    )
  }
}

