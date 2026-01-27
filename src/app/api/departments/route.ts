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
        include: {
          _count: {
            select: { schemes: true }
          }
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

    if (!user || user.role !== 'ADMIN') {
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

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    const user = token ? await verifyAuth(token) : null;

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode'); // 'all' or 'ids'
    const idsString = searchParams.get('ids');
    const query = searchParams.get('q') || '';

    if (mode === 'all') {
      // Delete all matching the current search query
      const where = {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { nameHn: { contains: query, mode: 'insensitive' } } as any,
        ],
      };

      const result = await prisma.$transaction(async (tx) => {
        // 1. Get IDs of departments that will be deleted
        const deptsToDelete = await tx.department.findMany({
          where,
          select: { id: true }
        });
        const deptIds = deptsToDelete.map(d => d.id);

        if (deptIds.length === 0) return { count: 0 };

        // 2. Get all schemes for these departments
        const schemesToDelete = await tx.scheme.findMany({
          where: { department_id: { in: deptIds } },
          select: { id: true }
        });
        const schemeIds = schemesToDelete.map(s => s.id);

        if (schemeIds.length > 0) {
          // 3. Delete all mappings for these schemes
          await tx.mapping.deleteMany({
            where: { scheme_id: { in: schemeIds } }
          });

          // 4. Delete all schemes
          await tx.scheme.deleteMany({
            where: { department_id: { in: deptIds } }
          });
        }

        // 5. Delete departments
        const deleted = await tx.department.deleteMany({ where });
        return deleted;
      });

      // Audit Log
      await (prisma.auditLog as any).create({
        data: {
          userId: user.id,
          action: "BULK_DELETE_DEPARTMENTS_CASCADE",
          module: "DEPARTMENTS",
          details: { count: result.count, query },
        },
      });

      return NextResponse.json({ count: result.count });
    } else if (idsString) {
      const ids = idsString.split(',');

      const result = await prisma.$transaction(async (tx) => {
        // 1. Get all schemes for these departments
        const schemesToDelete = await tx.scheme.findMany({
          where: { department_id: { in: ids } },
          select: { id: true }
        });
        const schemeIds = schemesToDelete.map(s => s.id);

        if (schemeIds.length > 0) {
          // 2. Delete all mappings for these schemes
          await tx.mapping.deleteMany({
            where: { scheme_id: { in: schemeIds } }
          });

          // 3. Delete all schemes
          await tx.scheme.deleteMany({
            where: { department_id: { in: ids } }
          });
        }

        // 4. Delete departments
        const deleted = await tx.department.deleteMany({
          where: { id: { in: ids } }
        });
        return deleted;
      });

      // Audit Log
      await (prisma.auditLog as any).create({
        data: {
          userId: user.id,
          action: "BULK_DELETE_DEPARTMENTS_CASCADE",
          module: "DEPARTMENTS",
          details: { count: result.count, ids },
        },
      });

      return NextResponse.json({ count: result.count });
    }

    return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
  } catch (error) {
    console.error("Bulk delete departments error:", error);
    return NextResponse.json({ error: "Failed to delete departments" }, { status: 500 });
  }
}
