import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId') || '';
    const appointmentId = searchParams.get('appointmentId') || '';
    const doctorId = searchParams.get('doctorId') || '';

    let appointmentIds: string[] | undefined = undefined;
    if (doctorId) {
      const apps = await prisma.appointment.findMany({
        where: { doctorId },
        select: { id: true }
      });
      appointmentIds = apps.map(a => a.id);
    }

    const labReports = await prisma.labReport.findMany({
      where: {
        AND: [
          patientId ? { patientId } : {},
          appointmentId ? { appointmentId } : {},
          appointmentIds ? { appointmentId: { in: appointmentIds } } : {}
        ]
      },
      orderBy: { uploadedAt: 'desc' }
    });

    return NextResponse.json({ labReports });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { labOrderId, appointmentId, reportTitle, reportType, findings, notes, uploadedBy, fileName, fileUrl } = body;

    let resolvedLabOrderId = labOrderId;
    let resolvedAppointmentId = appointmentId;
    let resolvedPatientId = '';

    const today = new Date();
    const dateStr = today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0');
    const sequence = String(Math.floor(Math.random() * 900) + 100);

    if (labOrderId) {
      const labOrder = await prisma.labOrder.findUnique({
        where: { id: labOrderId }
      });
      if (labOrder) {
        resolvedAppointmentId = labOrder.appointmentId;
        resolvedPatientId = labOrder.patientId;
        
        await prisma.labOrder.update({
          where: { id: labOrderId },
          data: { status: 'completed' }
        });
      }
    }

    if (!resolvedPatientId && resolvedAppointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: resolvedAppointmentId }
      });
      if (appointment) {
        resolvedPatientId = appointment.patientId || '';
      }
    }

    if (!resolvedPatientId) {
      return NextResponse.json({ error: 'Valid Appointment ID or Lab Order ID is required.' }, { status: 400 });
    }

    if (!resolvedLabOrderId) {
      resolvedLabOrderId = `LO-DIRECT-${dateStr}-${sequence}`;
    }

    const reportId = `RPT-${dateStr}-${sequence}`;

    const labReport = await prisma.labReport.create({
      data: {
        id: reportId,
        labOrderId: resolvedLabOrderId,
        appointmentId: resolvedAppointmentId,
        patientId: resolvedPatientId,
        uploadedBy,
        reportTitle,
        reportType: reportType || 'blood-test',
        findings,
        notes: notes || '',
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        isVisiblePatient: true
      }
    });

    return NextResponse.json({ success: true, labReport });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
