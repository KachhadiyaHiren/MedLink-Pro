import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId') || '';
    const patientId = searchParams.get('patientId') || '';

    const appointments = await prisma.appointment.findMany({
      where: {
        AND: [
          doctorId ? { doctorId } : {},
          patientId ? { patientId } : {}
        ]
      },
      orderBy: [
        { appointmentDate: 'desc' },
        { appointmentTime: 'desc' }
      ]
    });

    return NextResponse.json({ appointments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { doctorId, patientId, familyMemberId, appointmentDate, appointmentTime, visitType, chiefComplaint, status } = body;

    // Generate appointment ID: APT-YYYYMMDD-SEQ
    const today = new Date();
    const dateStr = today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0');
    const sequence = String(Math.floor(Math.random() * 900) + 100);
    const appointmentId = `APT-${dateStr}-${sequence}`;

    const appointment = await prisma.appointment.create({
      data: {
        id: appointmentId,
        doctorId,
        patientId: patientId || null,
        familyMemberId: familyMemberId || null,
        appointmentDate,
        appointmentTime,
        status: status || 'scheduled',
        visitType,
        chiefComplaint,
        notes: ''
      }
    });

    return NextResponse.json({ appointment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId, status, notes } = body;

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status,
        ...(notes ? { notes } : {})
      }
    });

    return NextResponse.json({ appointment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
