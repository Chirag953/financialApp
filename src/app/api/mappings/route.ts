import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";

const mappingSchema = z.object({
  scheme_id: z.string().uuid(),
  category_id: z.string().uuid(),
  part_id: z.string().uuid().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schemeId = searchParams.get('schemeId');

    if (!schemeId) {
      return NextResponse.json({ error: "Scheme ID is required" }, { status: 400 });
    }

    const mappings = await prisma.mapping.findMany({
      where: { scheme_id: schemeId },
      include: {
        category: true,
        part: true,
      },
    });

    return NextResponse.json(mappings);
  } catch (error) {
    console.error("Fetch mappings error:", error);
    return NextResponse.json({ error: "Failed to fetch mappings" }, { status: 500 });
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
    const validatedData = mappingSchema.parse(body);

    // Check if mapping already exists
    const existingMapping = await prisma.mapping.findFirst({
      where: {
        scheme_id: validatedData.scheme_id,
        category_id: validatedData.category_id,
        part_id: validatedData.part_id,
      },
    });

    if (existingMapping) {
      return NextResponse.json({ error: "Mapping already exists" }, { status: 400 });
    }

    const mapping = await prisma.mapping.create({
      data: validatedData,
      include: {
        category: true,
        part: true,
        scheme: { select: { scheme_name: true } }
      }
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE_MAPPING",
        module: "MAPPINGS",
        details: mapping as any,
      },
    });

    return NextResponse.json(mapping);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Create mapping error:", error);
    return NextResponse.json({ error: "Failed to create mapping" }, { status: 500 });
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Mapping ID is required" }, { status: 400 });
    }

    const mapping = await prisma.mapping.delete({
      where: { id },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "DELETE_MAPPING",
        module: "MAPPINGS",
        details: mapping as any,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete mapping error:", error);
    return NextResponse.json({ error: "Failed to delete mapping" }, { status: 500 });
  }
}
