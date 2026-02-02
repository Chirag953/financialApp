import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";

const schemeSchema = z.object({
  scheme_code: z.string().length(13, "Scheme code must be exactly 13 digits"),
  scheme_name: z.string().min(1, "Scheme name is required"),
  financial_year: z.string().optional(),
  total_budget_provision: z.number().min(0),
  progressive_allotment: z.number().min(0),
  actual_progressive_expenditure: z.number().min(0),
  provisional_expenditure_current_month: z.number().min(0),
  department_id: z.string().uuid(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const deptId = searchParams.get('deptId') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const financialYear = searchParams.get('financialYear') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const skip = (page - 1) * limit;

    const where: any = {
      AND: [
        {
          OR: [
            { scheme_name: { contains: query, mode: 'insensitive' } },
            { scheme_code: { contains: query, mode: 'insensitive' } },
            { 
              mappings: {
                some: {
                  category: {
                    name: { contains: query, mode: 'insensitive' }
                  }
                }
              }
            }
          ],
        }
      ]
    };

    if (deptId) {
      where.AND.push({ department_id: deptId });
    }

    if (financialYear) {
      where.AND.push({ financial_year: financialYear });
    }

    if (categoryId) {
      where.AND.push({
        mappings: {
          some: {
            category_id: categoryId
          }
        }
      });
    }

    const [schemes, total] = await Promise.all([
      prisma.scheme.findMany({
        where,
        include: { 
          department: { select: { name: true, nameHn: true } },
          mappings: {
            include: {
              category: true,
              part: true
            }
          }
        } as any,
        orderBy: { scheme_code: 'asc' },
        skip,
        take: limit,
      }),
      prisma.scheme.count({ where }),
    ]);

    // Calculate percentages on the fly if needed, though they are stored in DB
    // The PRD says 8 columns, and we have them in the model.
    
    return NextResponse.json({
      schemes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch schemes error:", error);
    return NextResponse.json({ error: "Failed to fetch schemes" }, { status: 500 });
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
    const validatedData = schemeSchema.parse(body);

    // Calculate percentages
    const pct_budget_expenditure = validatedData.total_budget_provision > 0 
      ? (validatedData.actual_progressive_expenditure / validatedData.total_budget_provision) * 100 
      : 0;
    
    const pct_actual_expenditure = validatedData.progressive_allotment > 0 
      ? (validatedData.actual_progressive_expenditure / validatedData.progressive_allotment) * 100 
      : 0;

    const scheme = await prisma.scheme.create({
      data: {
        ...validatedData,
        pct_budget_expenditure,
        pct_actual_expenditure,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE_SCHEME",
        module: "SCHEMES",
        details: scheme as any,
      },
    });

    return NextResponse.json(scheme);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Create scheme error:", error);
    return NextResponse.json({ error: "Failed to create scheme" }, { status: 500 });
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
    const deptId = searchParams.get('deptId') || '';
    const financialYear = searchParams.get('financialYear') || '';

    if (mode === 'all') {
      const where: any = {
        AND: [
          {
            OR: [
              { scheme_name: { contains: query, mode: 'insensitive' } },
              { scheme_code: { contains: query, mode: 'insensitive' } },
            ],
          }
        ]
      };

      if (deptId) {
        where.AND.push({ department_id: deptId });
      }

      if (financialYear) {
        where.AND.push({ financial_year: financialYear });
      }

      const result = await prisma.$transaction(async (tx) => {
        // 1. Get IDs of schemes to be deleted
        const schemesToDelete = await tx.scheme.findMany({
          where,
          select: { id: true }
        });
        const schemeIds = schemesToDelete.map(s => s.id);

        if (schemeIds.length === 0) return { count: 0 };

        // 2. Delete all mappings for these schemes
        await tx.mapping.deleteMany({
          where: { scheme_id: { in: schemeIds } }
        });

        // 3. Delete schemes
        const deleted = await tx.scheme.deleteMany({ where });
        return deleted;
      });

      // Audit Log
      await (prisma.auditLog as any).create({
        data: {
          userId: user.id,
          action: "BULK_DELETE_SCHEMES_CASCADE",
          module: "SCHEMES",
          details: { count: result.count, query, deptId, financialYear },
        },
      });

      return NextResponse.json({ count: result.count });
    } else if (idsString) {
      const ids = idsString.split(',');

      const result = await prisma.$transaction(async (tx) => {
        // 1. Delete all mappings for these schemes
        await tx.mapping.deleteMany({
          where: { scheme_id: { in: ids } }
        });

        // 2. Delete schemes
        const deleted = await tx.scheme.deleteMany({
          where: { id: { in: ids } }
        });
        return deleted;
      });

      // Audit Log
      await (prisma.auditLog as any).create({
        data: {
          userId: user.id,
          action: "BULK_DELETE_SCHEMES_CASCADE",
          module: "SCHEMES",
          details: { count: result.count, ids },
        },
      });

      return NextResponse.json({ count: result.count });
    }

    return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
  } catch (error) {
    console.error("Bulk delete schemes error:", error);
    return NextResponse.json({ error: "Failed to delete schemes" }, { status: 500 });
  }
}

