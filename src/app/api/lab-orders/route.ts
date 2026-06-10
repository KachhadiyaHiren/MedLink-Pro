import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const labId = searchParams.get('labId') || '';
    const patientId = searchParams.get('patientId') || '';
    const doctorId = searchParams.get('doctorId') || '';

    const labOrders = await prisma.labOrder.findMany({
      where: {
        AND: [
          patientId ? { patientId } : {},
          doctorId ? { doctorId } : {},
          labId ? {
            OR: [
              { labId },
              { status: 'ordered' } // Display unassigned orders to be claimed
            ]
          } : {}
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ labOrders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { labOrderId, status, labId } = body;

    const labOrder = await prisma.labOrder.update({
      where: { id: labOrderId },
      data: {
        status,
        ...(labId ? { labId } : {})
      }
    });

    return NextResponse.json({ labOrder });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
