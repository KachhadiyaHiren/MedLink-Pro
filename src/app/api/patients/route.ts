import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const patientId = searchParams.get('patientId') || '';

    if (patientId) {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: { familyMembers: true }
      });
      return NextResponse.json({ patient });
    }

    const patients = await prisma.patient.findMany({
      where: query ? {
        OR: [
          { name: { contains: query } },
          { id: { contains: query } },
          { primaryPhone: { contains: query } }
        ]
      } : {},
      include: { familyMembers: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ patients });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, primaryPhone, email, dateOfBirth, gender, bloodGroup, address, emergencyContact, allergies, chronicConditions } = body;

    // Verify if patient already exists as a user
    const existing = await prisma.user.findUnique({ where: { phone: primaryPhone } });
    if (existing) {
      if (existing.role === 'patient') {
        const existingPatient = await prisma.patient.findFirst({ where: { primaryPhone } });
        if (existingPatient) {
          return NextResponse.json({ patient: existingPatient });
        }
      }
      return NextResponse.json({ error: 'A user with this phone number already exists.' }, { status: 400 });
    }

    // Auto-generate PAT Code
    const count = await prisma.patient.count();
    const patientId = `PAT-${String(count + 1).padStart(5, '0')}`;

    // Create user login entry
    await prisma.user.create({
      data: {
        id: patientId,
        phone: primaryPhone,
        fullName: name,
        role: 'patient',
        profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
      }
    });

    const patient = await prisma.patient.create({
      data: {
        id: patientId,
        name,
        primaryPhone,
        email,
        dateOfBirth,
        gender,
        bloodGroup,
        address,
        emergencyContact,
        allergies,
        chronicConditions
      }
    });

    return NextResponse.json({ patient });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
