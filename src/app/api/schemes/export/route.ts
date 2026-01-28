import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as XLSX from 'xlsx';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const deptId = searchParams.get('deptId') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const schemeId = searchParams.get('schemeId') || '';

    const where: any = {};

    if (schemeId) {
      where.id = schemeId;
    } else {
      where.OR = [
        { scheme_name: { contains: query, mode: 'insensitive' } },
        { scheme_code: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (deptId) {
      where.department_id = deptId;
    }

    if (categoryId) {
      where.mappings = {
        some: {
          category_id: categoryId
        }
      };
    }

    const schemes = await prisma.scheme.findMany({
      where,
      include: { department: { select: { name: true } } },
      orderBy: { scheme_code: 'asc' },
    });

    // Format data for Excel
    const data = schemes.map(s => ({
      'Scheme Code': s.scheme_code,
      'Scheme Name': s.scheme_name,
      'Department': s.department.name,
      'Total Budget Provision': Number(s.total_budget_provision),
      'Progressive Allotment': Number(s.progressive_allotment),
      'Actual Progressive Expenditure': Number(s.actual_progressive_expenditure),
      '% Budget Expenditure': Number(s.pct_budget_expenditure).toFixed(2) + '%',
      '% Actual Expenditure': Number(s.pct_actual_expenditure).toFixed(2) + '%',
      'Provisional Expenditure (Current Month)': Number(s.provisional_expenditure_current_month),
    }));

    // Generate Excel
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Schemes');
    
    // Generate buffer
    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return as file download
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Schemes_Report.xlsx"',
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}

