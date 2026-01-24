import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const sessionToken = (await cookies()).get('session')?.value;
    const session = sessionToken ? await verifyAuth(sessionToken) : null;
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await (prisma as any).setting.findMany();
    
    // Convert to key-value object
    const settingsMap = settings.reduce((acc: Record<string, string>, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionToken = (await cookies()).get('session')?.value;
    const session = sessionToken ? await verifyAuth(sessionToken) : null;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings format' }, { status: 400 });
    }

    // Update or create each setting
    const updatePromises = Object.entries(settings).map(([key, value]) => 
      (prisma as any).setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );

    await Promise.all(updatePromises);

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'UPDATE_SETTINGS',
        module: 'SYSTEM_SETTINGS',
        details: { keys: Object.keys(settings) },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
