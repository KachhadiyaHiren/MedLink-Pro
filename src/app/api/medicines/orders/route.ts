import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId') || '';

    const orders = await prisma.medicineOrder.findMany({
      where: patientId ? { patientId } : {},
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, prescriptionId, items, totalAmount, deliveryAddress } = body;

    const today = new Date();
    const dateStr = today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0');
    const sequence = String(Math.floor(Math.random() * 900) + 100);
    const orderId = `MO-${dateStr}-${sequence}`;

    const order = await prisma.medicineOrder.create({
      data: {
        id: orderId,
        patientId,
        prescriptionId: prescriptionId || null,
        itemsJson: JSON.stringify(items),
        totalAmount: parseFloat(totalAmount),
        status: 'placed',
        deliveryAddress
      }
    });

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
