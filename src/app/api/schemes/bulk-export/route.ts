import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as XLSX from 'xlsx';
import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    const user = token ? await verifyAuth(token) : null;

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const schemes = await prisma.scheme.findMany({
      orderBy: { scheme_code: 'asc' },
    });

    // Format data for CSV as per requirements
    const data = schemes.map(s => ({
      'scheme_code': s.scheme_code,
      'scheme_name': s.scheme_name,
      'total_budget_provision': Number(s.total_budget_provision),
      'progressive_allotment': Number(s.progressive_allotment),
      'actual_progressive_expenditure_upto_dec': Number(s.actual_progressive_expenditure),
      'percent_budget_expenditure': Number(s.pct_budget_expenditure),
      'percent_actual_expenditure': Number(s.pct_actual_expenditure),
      'provisional_expenditure_current_month': Number(s.provisional_expenditure_current_month),
    }));

    // Generate CSV
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    // Return as file download
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="schemes_export.csv"',
      },
    });
  } catch (error) {
    console.error("Bulk export error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}

