import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  has_parts: z.boolean().default(false),
  parts: z.array(z.string()).optional(),
  icon: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { parts: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Fetch categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
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
    const validatedData = categorySchema.parse(body);

    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        has_parts: validatedData.has_parts,
        icon: validatedData.icon,
        image: validatedData.image,
        parts: validatedData.has_parts ? {
          create: (validatedData.parts || []).map(partName => ({ part_name: partName }))
        } : undefined
      } as any,
      include: { parts: true }
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE_CATEGORY",
        module: "CATEGORIES",
        details: category as any,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Create category error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
