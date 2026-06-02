import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId') || '';

    if (!doctorId) {
      return NextResponse.json({ error: 'doctorId is required.' }, { status: 400 });
    }

    // Fetch sent and received referrals
    const sentReferrals = await prisma.referral.findMany({
      where: { referringDoctorId: doctorId },
      orderBy: { createdAt: 'desc' }
    });

    const receivedReferrals = await prisma.referral.findMany({
      where: { referredToDoctorId: doctorId },
      orderBy: { createdAt: 'desc' }
    });

    // Resolve doctor and patient names for display
    const patientIds = Array.from(new Set([
      ...sentReferrals.map(r => r.patientId),
      ...receivedReferrals.map(r => r.patientId)
    ]));

    const doctorIds = Array.from(new Set([
      ...sentReferrals.map(r => r.referredToDoctorId),
      ...receivedReferrals.map(r => r.referringDoctorId)
    ]));

    const patients = await prisma.patient.findMany({
      where: { id: { in: patientIds } },
      select: { id: true, name: true }
    });

    const patientMap = new Map(patients.map(p => [p.id, p.name]));
    const doctorList = await prisma.doctor.findMany({
      where: { id: { in: [doctorId, ...doctorIds] } }
    });
    const doctorMap = new Map(doctorList.map(d => [d.id, { name: d.name, speciality: d.speciality }]));

    const formatReferralList = (list: any[]) => {
      return list.map(ref => {
        const patName = patientMap.get(ref.patientId) || 'Unknown Patient';
        const refDoctor = doctorMap.get(ref.referringDoctorId);
        const destDoctor = doctorMap.get(ref.referredToDoctorId);

        return {
          ...ref,
          patientName: patName,
          referringDoctorName: refDoctor ? refDoctor.name : 'Unknown Doctor',
          referringDoctorSpeciality: refDoctor ? refDoctor.speciality : '',
          referredToDoctorName: destDoctor ? destDoctor.name : 'Unknown Doctor',
          referredToDoctorSpeciality: destDoctor ? destDoctor.speciality : ''
        };
      });
    };

    return NextResponse.json({
      sent: formatReferralList(sentReferrals),
      received: formatReferralList(receivedReferrals)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId, referringDoctorId, referredToDoctorId, patientId, reason, urgency, notes } = body;

    if (!appointmentId || !referringDoctorId || !referredToDoctorId || !patientId || !reason || !urgency) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Generate unique referral ID: REF-YYYYMMDD-SEQ
    const today = new Date();
    const dateStr = today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0');
    const sequence = String(Math.floor(Math.random() * 900) + 100);
    const referralId = `REF-${dateStr}-${sequence}`;

    const referral = await prisma.referral.create({
      data: {
        id: referralId,
        appointmentId,
        referringDoctorId,
        referredToDoctorId,
        patientId,
        reason,
        urgency,
        notes: notes || '',
        status: 'sent'
      }
    });

    return NextResponse.json({ success: true, referral });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralId, status } = body;

    if (!referralId || !status) {
      return NextResponse.json({ error: 'referralId and status are required.' }, { status: 400 });
    }

    const referral = await prisma.referral.update({
      where: { id: referralId },
      data: { status }
    });

    return NextResponse.json({ success: true, referral });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
