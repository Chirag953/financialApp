import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";

const departmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameHn: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const skip = (page - 1) * limit;

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { nameHn: { contains: query, mode: 'insensitive' } } as any,
          ],
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.department.count({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { nameHn: { contains: query, mode: 'insensitive' } } as any,
          ],
        },
      }),
    ]);

    return NextResponse.json({
      departments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch departments error:", error);
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    const user = token ? await verifyAuth(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = departmentSchema.parse(body);

    const department = await prisma.department.create({
      data: {
        name: validatedData.name,
        nameHn: validatedData.nameHn,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE_DEPARTMENT",
        module: "DEPARTMENTS",
        details: department as any,
      },
    });

    return NextResponse.json(department);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Create department error:", error);
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
  }
}
