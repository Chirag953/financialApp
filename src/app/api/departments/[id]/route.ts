import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";

const departmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameHn: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        schemes: {
          orderBy: { scheme_code: 'asc' }
        }
      }
    });

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    // Calculate aggregate budget data
    const totalBudget = department.schemes.reduce((acc, s) => acc + Number(s.total_budget_provision), 0);
    const totalExpenditure = department.schemes.reduce((acc, s) => acc + Number(s.actual_progressive_expenditure), 0);
    const totalAllotment = department.schemes.reduce((acc, s) => acc + Number(s.progressive_allotment), 0);

    return NextResponse.json({
      ...department,
      summary: {
        totalBudget,
        totalExpenditure,
        totalAllotment,
        utilizationPercentage: totalBudget > 0 ? (totalExpenditure / totalBudget) * 100 : 0,
        schemeCount: department.schemes.length
      }
    });
  } catch (error) {
    console.error("Fetch department error:", error);
    return NextResponse.json({ error: "Failed to fetch department" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    const user = token ? await verifyAuth(token) : null;

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = departmentSchema.parse(body);

    const existingDepartment = await prisma.department.findUnique({
      where: { id }
    });

    if (!existingDepartment) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: {
        name: validatedData.name,
        nameHn: validatedData.nameHn,
      },
    });

    // Create Audit Log
    await (prisma.auditLog as any).create({
      data: {
        userId: user.id,
        action: "UPDATE_DEPARTMENT",
        module: "DEPARTMENTS",
        details: {
          before: existingDepartment,
          after: updatedDepartment
        },
      },
    });

    return NextResponse.json(updatedDepartment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Update department error:", error);
    return NextResponse.json({ error: "Failed to update department" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    const user = token ? await verifyAuth(token) : null;

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const department = await prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { schemes: true } } }
    });

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    // Perform deletion in a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // 1. Get all schemes for this department to delete their mappings
      const schemes = await tx.scheme.findMany({
        where: { department_id: id },
        select: { id: true }
      });
      
      const schemeIds = schemes.map(s => s.id);

      if (schemeIds.length > 0) {
        // 2. Delete all mappings associated with these schemes
        await tx.mapping.deleteMany({
          where: { scheme_id: { in: schemeIds } }
        });

        // 3. Delete all schemes associated with this department
        await tx.scheme.deleteMany({
          where: { department_id: id }
        });
      }

      // 4. Finally delete the department
      await tx.department.delete({
        where: { id }
      });
    });

    // Create Audit Log
    await (prisma.auditLog as any).create({
      data: {
        userId: user.id,
        action: "DELETE_DEPARTMENT_CASCADE",
        module: "DEPARTMENTS",
        details: {
          department: department as any,
          schemesDeleted: department._count.schemes
        },
      },
    });

    return NextResponse.json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("Delete department error:", error);
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 });
  }
}
