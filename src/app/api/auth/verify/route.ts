import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { phone, role, userId } = await request.json();
    
    // Find user in database
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        phone: phone,
        role: role
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User account not found matching details.' }, { status: 404 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'This user account is suspended.' }, { status: 403 });
    }

    // Verify approval status for doctors
    if (role === 'doctor') {
      const doc = await prisma.doctor.findUnique({ where: { id: userId } });
      if (doc && !doc.isApproved) {
        return NextResponse.json({ error: 'Doctor account is pending administrator approval.' }, { status: 403 });
      }
    }

    if (role === 'assistant') {
      const assistant = await prisma.assistant.findUnique({ where: { id: userId } });
      if (assistant) {
        return NextResponse.json({
          user: {
            id: user.id,
            phone: user.phone,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            profilePhoto: user.profilePhoto,
            doctorId: assistant.doctorId
          }
        });
      }
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
