import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/* ================= POST : CREATE INCOMING ================= */

export async function POST(request: NextRequest) {

  try {

    const session = request.cookies.get('session')

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const {
      date,
      computerCode,
      partNo,
      productName,
      incomingQty,
      batch,
      responsiblePerson
    } = body


    /* ================= VALIDATION ================= */

    if (
      !computerCode ||
      !responsiblePerson ||
      incomingQty === undefined ||
      batch === undefined ||
      !date
    ) {

      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )

    }

    const incoming = Number(incomingQty)

    if (incoming <= 0) {

      return NextResponse.json(
        { message: 'Incoming must be greater than zero' },
        { status: 400 }
      )

    }


    /* ================= CREATE ================= */

    await prisma.incomingTransaction.create({

      data: {

        date: new Date(date),

        computerCode: String(computerCode).trim().toUpperCase(),

        partNo: partNo?.trim() || '',
        productName: productName?.trim() || '',

        incomingQty: incoming,

        remainingQty: incoming,

        status: 'OPEN',

        // batch sekarang String
        batch: batch ? String(batch).trim() : null,

        responsiblePerson: responsiblePerson.trim()

      }

    })


    return NextResponse.json(
      { success: true },
      { status: 201 }
    )

  } catch (error) {

    console.error('[Incoming POST]', error)

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )

  }

}


/* ================= GET : OPEN INCOMING ================= */

export async function GET(request: NextRequest) {

  try {

    const session = request.cookies.get('session')

    if (!session) {

      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )

    }

    const transactions = await prisma.incomingTransaction.findMany({

      where: {
        status: 'OPEN'
      },

      orderBy: {
        date: 'desc'
      },

      include: {

        afterOQC: {

          orderBy: {
            createdAt: 'desc'
          }

        }

      }

    })


    return NextResponse.json(transactions)

  } catch (error) {

    console.error('[Incoming GET]', error)

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )

  }

}