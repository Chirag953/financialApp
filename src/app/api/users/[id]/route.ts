import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionToken = (await cookies()).get('session')?.value;
    const session = sessionToken ? await verifyAuth(sessionToken) : null;
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, password, name, role } = await request.json();
    const { id } = await params;

    const updateData: any = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'UPDATE_USER',
        module: 'USER_MGMT',
        details: { targetId: id, changes: Object.keys(updateData) },
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionToken = (await cookies()).get('session')?.value;
    const session = sessionToken ? await verifyAuth(sessionToken) : null;
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Prevent self-deletion
    if (id === session.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'DELETE_USER',
        module: 'USER_MGMT',
        details: { targetId: id },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
