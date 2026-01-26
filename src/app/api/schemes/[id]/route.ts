import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";

const schemeSchema = z.object({
  scheme_code: z.string().length(13, "Scheme code must be exactly 13 digits").optional(),
  scheme_name: z.string().min(1, "Scheme name is required").optional(),
  total_budget_provision: z.number().min(0).optional(),
  progressive_allotment: z.number().min(0).optional(),
  actual_progressive_expenditure: z.number().min(0).optional(),
  provisional_expenditure_current_month: z.number().min(0).optional(),
  department_id: z.string().uuid().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    const user = token ? await verifyAuth(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = schemeSchema.parse(body);

    const currentScheme = await prisma.scheme.findUnique({
      where: { id }
    });

    if (!currentScheme) {
      return NextResponse.json({ error: "Scheme not found" }, { status: 404 });
    }

    // Merge existing data with updates to calculate percentages
    const updatedValues = {
      total_budget_provision: validatedData.total_budget_provision ?? Number(currentScheme.total_budget_provision),
      progressive_allotment: validatedData.progressive_allotment ?? Number(currentScheme.progressive_allotment),
      actual_progressive_expenditure: validatedData.actual_progressive_expenditure ?? Number(currentScheme.actual_progressive_expenditure),
    };

    const pct_budget_expenditure = updatedValues.total_budget_provision > 0 
      ? (updatedValues.actual_progressive_expenditure / updatedValues.total_budget_provision) * 100 
      : 0;
    
    const pct_actual_expenditure = updatedValues.progressive_allotment > 0 
      ? (updatedValues.actual_progressive_expenditure / updatedValues.progressive_allotment) * 100 
      : 0;

    const scheme = await prisma.scheme.update({
      where: { id },
      data: {
        ...validatedData,
        pct_budget_expenditure,
        pct_actual_expenditure,
      },
    });

    // Create Audit Log
    await (prisma.auditLog as any).create({
      data: {
        userId: user.id,
        action: "UPDATE_SCHEME",
        module: "SCHEMES",
        details: {
          old: currentScheme as any,
          new: scheme as any,
        },
      },
    });

    return NextResponse.json(scheme);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Update scheme error:", error);
    return NextResponse.json({ error: "Failed to update scheme" }, { status: 500 });
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

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if scheme has mappings
    const mappingsCount = await prisma.mapping.count({
      where: { scheme_id: id }
    });

    if (mappingsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete scheme with existing category mappings" },
        { status: 400 }
      );
    }

    const scheme = await prisma.scheme.delete({
      where: { id },
    });

    // Create Audit Log
    await (prisma.auditLog as any).create({
      data: {
        userId: user.id,
        action: "DELETE_SCHEME",
        module: "SCHEMES",
        details: scheme as any,
      },
    });

    return NextResponse.json({ message: "Scheme deleted successfully" });
  } catch (error) {
    console.error("Delete scheme error:", error);
    return NextResponse.json({ error: "Failed to delete scheme" }, { status: 500 });
  }
}
