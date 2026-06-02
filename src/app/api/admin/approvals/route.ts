import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const pendingDoctors = await prisma.doctor.findMany({
      where: { isApproved: false }
    });

    const pending = pendingDoctors.map(d => ({
      id: d.id,
      name: d.name,
      meta: d.speciality,
      type: 'doctor'
    }));

    return NextResponse.json({ pending });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { partnerId, type } = body;

    if (type === 'doctor') {
      await prisma.doctor.update({
        where: { id: partnerId },
        data: { isApproved: true }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
