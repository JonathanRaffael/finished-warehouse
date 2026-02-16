import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session');
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('[Get products error]', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get('session');
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      computerCode,
      partNo,
      productName,
      location,
      initialStock,
      productionType, // HT / HK
    } = body;

    if (!computerCode || !partNo || !productName) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const normalizedCode = computerCode.trim().toUpperCase();

    const existing = await prisma.product.findUnique({
      where: { computerCode: normalizedCode },
    });

    if (existing) {
      return NextResponse.json(
        { message: 'Computer Code already exists' },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        computerCode: normalizedCode,
        partNo: partNo.trim(),
        productName: productName.trim(),
        productionType: productionType || 'HT',
        location: location ? location.trim() : null,
        initialStock: Number(initialStock) || 0,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('[Create product error]', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
