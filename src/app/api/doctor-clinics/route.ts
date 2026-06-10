import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId') || '';

    if (!doctorId) {
      return NextResponse.json({ error: 'doctorId is required.' }, { status: 400 });
    }

    const clinics = await prisma.doctorClinic.findMany({
      where: { doctorId },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json({ clinics });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { doctorId, name, address, phone } = body;

    if (!doctorId || !name || !address) {
      return NextResponse.json({ error: 'doctorId, name, and address are required.' }, { status: 400 });
    }

    // Check count limit (max 10 secondary clinics)
    const existingCount = await prisma.doctorClinic.count({ where: { doctorId } });
    if (existingCount >= 10) {
      return NextResponse.json({ error: 'Maximum of 10 secondary clinics allowed.' }, { status: 400 });
    }

    const today = new Date();
    const dateStr = today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0');
    const seq = String(existingCount + 1).padStart(3, '0');
    const clinicId = `DCLNC-${doctorId.replace('DOC-', '')}-${dateStr}-${seq}`;

    const clinic = await prisma.doctorClinic.create({
      data: {
        id: clinicId,
        doctorId,
        name,
        address,
        phone: phone || null,
        isPrimary: false,
        sortOrder: existingCount + 1
      }
    });

    return NextResponse.json({ clinic });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId') || '';

    if (!clinicId) {
      return NextResponse.json({ error: 'clinicId is required.' }, { status: 400 });
    }

    await prisma.doctorClinic.delete({ where: { id: clinicId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
