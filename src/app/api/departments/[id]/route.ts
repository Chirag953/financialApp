import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
