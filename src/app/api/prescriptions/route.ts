import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prescriptionId = searchParams.get('prescriptionId') || '';
    const patientId = searchParams.get('patientId') || '';
    const appointmentId = searchParams.get('appointmentId') || '';

    if (prescriptionId || appointmentId) {
      // Find prescription
      const rx = prescriptionId 
        ? await prisma.prescription.findUnique({ where: { id: prescriptionId } })
        : await prisma.prescription.findFirst({ where: { appointmentId } });

      if (!rx) {
        return NextResponse.json({ error: 'Prescription not found.' }, { status: 404 });
      }
      
      // Fetch related context records
      const doctor = await prisma.doctor.findUnique({ where: { id: rx.doctorId } });
      const patient = await prisma.patient.findUnique({ where: { id: rx.patientId } });
      const consultation = await prisma.consultation.findFirst({ where: { appointmentId: rx.appointmentId } });
      const labOrder = await prisma.labOrder.findFirst({ where: { appointmentId: rx.appointmentId } });

      return NextResponse.json({ rx, doctor, patient, consultation, labOrder });
    }

    const prescriptions = await prisma.prescription.findMany({
      where: patientId ? { patientId } : {},
      orderBy: { issuedAt: 'desc' }
    });

    return NextResponse.json({ prescriptions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
