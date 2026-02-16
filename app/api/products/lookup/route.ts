import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session');
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('computerCode');

    if (!keyword || !keyword.trim()) {
      return NextResponse.json(
        { message: 'Search keyword required' },
        { status: 400 }
      );
    }

    const q = keyword.trim().toUpperCase();

    // ✅ Search by Computer Code OR Part No
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { computerCode: q },
          { partNo: q },
        ],
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found', searched: q },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('[Lookup error]', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
