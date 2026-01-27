import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";

const categoryUpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  has_parts: z.boolean().default(false),
  parts: z.array(z.string()).optional(),
  icon: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
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

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = categoryUpdateSchema.parse(body);

    // Get current category state for audit log
    const currentCategory = await prisma.category.findUnique({
      where: { id },
      include: { parts: true }
    });

    if (!currentCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Update category
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: validatedData.name,
        has_parts: validatedData.has_parts,
        icon: validatedData.icon,
        image: validatedData.image,
        // For simplicity, we'll replace all parts if has_parts is true
        parts: validatedData.has_parts ? {
          deleteMany: {},
          create: validatedData.parts?.map(partName => ({ part_name: partName })) || []
        } : {
          deleteMany: {}
        }
      } as any,
      include: { parts: true }
    });

    // Create Audit Log
    await (prisma.auditLog as any).create({
      data: {
        userId: user.id,
        action: "UPDATE_CATEGORY",
        module: "CATEGORIES",
        details: {
          old: currentCategory,
          new: category
        } as any,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Update category error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
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

    // Check for existing mappings
    const mappingsCount = await prisma.mapping.count({
      where: { category_id: id }
    });

    if (mappingsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with existing scheme mappings." },
        { status: 400 }
      );
    }

    // Get category for audit log
    const category = await prisma.category.findUnique({
      where: { id },
      include: { parts: true }
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Delete related parts first (though Prisma cascade should handle if configured)
    await prisma.categoryPart.deleteMany({
      where: { category_id: id }
    });

    // Delete category
    await prisma.category.delete({
      where: { id }
    });

    // Create Audit Log
    await (prisma.auditLog as any).create({
      data: {
        userId: user.id,
        action: "DELETE_CATEGORY",
        module: "CATEGORIES",
        details: category as any,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
