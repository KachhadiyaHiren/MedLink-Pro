import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prescriptionId = searchParams.get('prescriptionId') || '';
    const patientId = searchParams.get('patientId') || '';
    const appointmentId = searchParams.get('appointmentId') || '';
    const doctorId = searchParams.get('doctorId') || '';

    if (prescriptionId || appointmentId) {
      // Find prescription
      const rx = prescriptionId 
        ? await prisma.prescription.findUnique({ where: { id: prescriptionId } })
        : await prisma.prescription.findFirst({ where: { appointmentId } });

      if (!rx) {
        // Check if this appointment resulted in a referral instead
        let reason = 'no_prescription';
        if (appointmentId) {
          const referral = await prisma.referral.findFirst({ where: { appointmentId } });
          if (referral) reason = 'referred';
        }
        return NextResponse.json({ error: 'Prescription not found.', reason }, { status: 404 });
      }
      
      // Fetch related context records
      const doctor = await prisma.doctor.findUnique({ where: { id: rx.doctorId } });
      const patient = await prisma.patient.findUnique({ 
        where: { id: rx.patientId },
        include: { familyMembers: true }
      });
      const consultation = await prisma.consultation.findFirst({ where: { appointmentId: rx.appointmentId } });
      const labOrder = await prisma.labOrder.findFirst({ where: { appointmentId: rx.appointmentId } });

      // Fetch the clinic record if a specific clinic was selected for this consultation
      let clinic = null;
      if (rx.clinicId) {
        clinic = await prisma.doctorClinic.findUnique({ where: { id: rx.clinicId } });
      }

      let targetPatient: any = patient;
      if (rx.familyMemberId && patient) {
        const fam = patient.familyMembers.find(f => f.id === rx.familyMemberId);
        if (fam) {
          targetPatient = {
            id: fam.id,
            name: fam.name,
            dateOfBirth: fam.dateOfBirth,
            gender: fam.gender,
            bloodGroup: fam.bloodGroup || patient.bloodGroup,
            allergies: fam.allergies,
            chronicConditions: fam.chronicConditions,
            primaryPhone: patient.primaryPhone,
            email: patient.email,
            address: patient.address,
            emergencyContact: patient.emergencyContact
          };
        }
      }

      return NextResponse.json({ rx, doctor, patient: targetPatient, consultation, labOrder, clinic });
    }

    const prescriptions = await prisma.prescription.findMany({
      where: {
        AND: [
          patientId ? { patientId } : {},
          doctorId ? { doctorId } : {}
        ]
      },
      orderBy: { issuedAt: 'desc' }
    });

    return NextResponse.json({ prescriptions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
