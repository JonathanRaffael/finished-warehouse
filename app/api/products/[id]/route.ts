import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = request.cookies.get('session');
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ message: 'Missing product id' }, { status: 400 });
    }

    const body = await request.json();

    const {
      computerCode,
      partNo,
      productName,
      productionType,
      location,
      initialStock,
    } = body;

    if (!computerCode || !partNo || !productName || !productionType) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        computerCode: computerCode.trim().toUpperCase(),
        partNo: partNo.trim(),
        productName: productName.trim(),
        productionType,
        location: location ? location.trim() : null,
        initialStock: Number(initialStock) || 0,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[UPDATE PRODUCT]', error);

    return NextResponse.json(
      { message: 'Failed updating product' },
      { status: 500 }
    );
  }
}

// ================= DELETE PRODUCT =================

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = request.cookies.get('session');
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ message: 'Missing product id' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('[DELETE PRODUCT]', error);

    return NextResponse.json(
      { message: 'Failed deleting product' },
      { status: 500 }
    );
  }
}
