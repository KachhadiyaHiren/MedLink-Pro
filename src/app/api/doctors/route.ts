import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includePending = searchParams.get('includePending') === 'true';
    const query = searchParams.get('query') || '';

    const doctors = await prisma.doctor.findMany({
      where: {
        AND: [
          includePending ? {} : { isApproved: true },
          query ? {
            OR: [
              { name: { contains: query } },
              { speciality: { contains: query } },
              { clinicName: { contains: query } }
            ]
          } : {}
        ]
      }
    });

    const doctorIds = doctors.map(d => d.id);
    const users = await prisma.user.findMany({
      where: {
        id: { in: doctorIds }
      },
      select: {
        id: true,
        phone: true
      }
    });

    const phoneMap = new Map(users.map(u => [u.id, u.phone]));
    const doctorsWithPhone = doctors.map(d => ({
      ...d,
      phone: phoneMap.get(d.id) || ''
    }));

    return NextResponse.json({ doctors: doctorsWithPhone });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, phone, speciality, qualifications, registrationNo, clinicName, clinicAddress, consultationFee, bio, languages, availableDays, profilePhoto } = body;

    // Verify phone doesn't exist in Users
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json({ error: 'A user with this phone number is already registered.' }, { status: 400 });
    }

    // Create user record
    await prisma.user.create({
      data: {
        id,
        phone,
        fullName: name,
        role: 'doctor',
        profilePhoto: profilePhoto || null
      }
    });

    // Create doctor profile record
    const doctor = await prisma.doctor.create({
      data: {
        id,
        name,
        speciality,
        qualifications,
        registrationNo,
        clinicName,
        clinicAddress,
        consultationFee: parseFloat(consultationFee),
        bio,
        languages,
        availableDays,
        profilePhoto: profilePhoto || null,
        isApproved: false // Doctor self-registration requires Admin approval
      }
    });

    return NextResponse.json({ doctor });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
