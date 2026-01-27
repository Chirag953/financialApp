import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const sessionToken = (await cookies()).get('session')?.value;
    const session = sessionToken ? await verifyAuth(sessionToken) : null;
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionToken = (await cookies()).get('session')?.value;
    const session = sessionToken ? await verifyAuth(sessionToken) : null;
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, password, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'CREATE_USER',
        module: 'USER_MGMT',
        details: { targetEmail: email, role },
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const sessionToken = (await cookies()).get('session')?.value;
    const session = sessionToken ? await verifyAuth(sessionToken) : null;
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');

    if (mode === 'all_viewers') {
      const result = await prisma.user.deleteMany({
        where: {
          role: 'VIEWER',
          id: { not: session.id } // Just in case an admin has role viewer (though unlikely)
        }
      });

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: session.id,
          action: 'BULK_DELETE_VIEWERS',
          module: 'USER_MGMT',
          details: { count: result.count },
        },
      });

      return NextResponse.json({ success: true, count: result.count });
    }

    return NextResponse.json({ error: 'Invalid delete mode' }, { status: 400 });
  } catch (error) {
    console.error('Bulk user deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete viewers' }, { status: 500 });
  }
}
