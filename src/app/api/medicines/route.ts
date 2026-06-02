import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';

    const medicines = await prisma.medicinesCatalog.findMany({
      where: query ? {
        OR: [
          { name: { contains: query } },
          { genericName: { contains: query } },
          { category: { contains: query } }
        ]
      } : {}
    });

    return NextResponse.json({ medicines });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
