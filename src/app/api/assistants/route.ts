import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');

    const assistants = await prisma.assistant.findMany({
      where: doctorId ? { doctorId } : {},
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ assistants });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, doctorId } = body;

    if (!name || !phone || !doctorId) {
      return NextResponse.json({ error: 'Missing required fields: name, phone, doctorId.' }, { status: 400 });
    }

    // Verify if phone is already in use
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json({ error: 'A user with this phone number already exists.' }, { status: 400 });
    }

    // Auto-generate Assistant Code
    const count = await prisma.assistant.count();
    const assistantId = `AST-${String(count + 1).padStart(5, '0')}`;

    // Create user login entry
    await prisma.user.create({
      data: {
        id: assistantId,
        phone,
        fullName: name,
        role: 'assistant',
        profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
      }
    });

    // Create assistant record
    const assistant = await prisma.assistant.create({
      data: {
        id: assistantId,
        name,
        phone,
        doctorId
      }
    });

    return NextResponse.json({ assistant });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assistantId = searchParams.get('assistantId');

    if (!assistantId) {
      return NextResponse.json({ error: 'Missing assistantId parameter.' }, { status: 400 });
    }

    // Delete assistant from Assistant table
    await prisma.assistant.delete({
      where: { id: assistantId }
    });

    // Delete assistant from User table
    await prisma.user.delete({
      where: { id: assistantId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
