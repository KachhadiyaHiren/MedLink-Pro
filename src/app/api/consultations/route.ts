import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId, subjective, objective, assessment, plan, vitalSigns, medicines, tests, followUpDate } = body;

    // Find appointment details
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 });
    }

    const today = new Date();
    const dateStr = today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0');
    const sequence = String(Math.floor(Math.random() * 900) + 100);

    // 1. Create Consultation
    const cnsId = `CNS-${dateStr}-${sequence}`;
    const consultation = await prisma.consultation.create({
      data: {
        id: cnsId,
        appointmentId,
        subjective,
        objective,
        assessment,
        plan,
        diagnosisCodes: '',
        bp: vitalSigns.bp || null,
        pulse: vitalSigns.pulse || null,
        temp: vitalSigns.temp || null,
        spo2: vitalSigns.spo2 || null,
        weight: vitalSigns.weight || null,
        height: vitalSigns.height || null,
        followUpDate: followUpDate || null
      }
    });

    // 2. Create Prescription if medicines exist
    let prescription = null;
    if (medicines && medicines.length > 0) {
      const rxId = `RX-${dateStr}-${sequence}`;
      prescription = await prisma.prescription.create({
        data: {
          id: rxId,
          consultationId: cnsId,
          appointmentId,
          doctorId: appointment.doctorId,
          patientId: appointment.patientId,
          familyMemberId: appointment.familyMemberId || null,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: plan,
          medicinesJson: JSON.stringify(medicines)
        }
      });
    }

    // 3. Create LabOrder if tests exist
    let labOrder = null;
    if (tests && tests.length > 0) {
      const loId = `LO-${dateStr}-${sequence}`;
      labOrder = await prisma.labOrder.create({
        data: {
          id: loId,
          appointmentId,
          doctorId: appointment.doctorId,
          patientId: appointment.patientId,
          labId: 'LAB-00001', // Assign to Main partner Center Apex
          testsJson: JSON.stringify(tests),
          status: 'ordered',
          notes: assessment
        }
      });
    }

    // 4. Update Appointment status
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'completed',
        notes: plan
      }
    });

    return NextResponse.json({
      success: true,
      consultation,
      prescription,
      labOrder
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
