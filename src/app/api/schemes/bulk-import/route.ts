import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as XLSX from 'xlsx';
import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";
import { z } from "zod";

const coerceToNumber = (val: any) => {
  if (val === undefined || val === null || val === '' || val === '-') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const num = Number(String(val).replace(/,/g, '').trim());
  return isNaN(num) ? 0 : num;
};

const importSchemeSchema = z.object({
  scheme_code: z.preprocess((val) => {
    const str = String(val || '').trim();
    if (str === '-' || !str || /[^0-9]/.test(str)) return "0";
    return str;
  }, z.string().transform(val => val.padStart(13, '0'))),
  scheme_name: z.string().min(1, "Scheme name is required"),
  total_budget_provision: z.preprocess(coerceToNumber, z.number().min(0)),
  progressive_allotment: z.preprocess(coerceToNumber, z.number().min(0)),
  actual_progressive_expenditure_upto_dec: z.preprocess(coerceToNumber, z.number().min(0)),
  percent_budget_expenditure: z.preprocess(coerceToNumber, z.number().min(0)),
  percent_actual_expenditure: z.preprocess(coerceToNumber, z.number().min(0)),
  provisional_expenditure_current_month: z.preprocess(coerceToNumber, z.number().min(0)),
});

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    const user = token ? await verifyAuth(token) : null;

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const deptId = formData.get('deptId') as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    
    // Improved character encoding detection for Hindi/UTF-8
    let workbook;
    if (file.name.toLowerCase().endsWith('.csv')) {
      const decoder = new TextDecoder('utf-8');
      const csvString = decoder.decode(buffer);
      workbook = XLSX.read(csvString, { type: 'string', raw: true });
    } else {
      workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
    }

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 });
    }

    // Validate columns of the first row
    const firstRow = jsonData[0] as any;
    const requiredColumns = [
      'scheme_code',
      'scheme_name',
      'total_budget_provision',
      'progressive_allotment',
      'actual_progressive_expenditure_upto_dec',
      'percent_budget_expenditure',
      'percent_actual_expenditure',
      'provisional_expenditure_current_month'
    ];

    for (const col of requiredColumns) {
      if (!(col in firstRow)) {
        return NextResponse.json({ error: `Missing required column: ${col}` }, { status: 400 });
      }
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const [index, row] of jsonData.entries()) {
      try {
        const validated = importSchemeSchema.parse(row);
        
        // Find if scheme exists
        const existingScheme = await prisma.scheme.findUnique({
          where: { scheme_code: validated.scheme_code }
        });

        if (existingScheme) {
          // Update existing
          await prisma.scheme.update({
            where: { id: existingScheme.id },
            data: {
              scheme_name: validated.scheme_name,
              total_budget_provision: validated.total_budget_provision,
              progressive_allotment: validated.progressive_allotment,
              actual_progressive_expenditure: validated.actual_progressive_expenditure_upto_dec,
              pct_budget_expenditure: validated.percent_budget_expenditure,
              pct_actual_expenditure: validated.percent_actual_expenditure,
              provisional_expenditure_current_month: validated.provisional_expenditure_current_month,
            }
          });
          successCount++;
        } else {
          // Create new - only if deptId is provided
          if (!deptId) {
            throw new Error(`Scheme code ${validated.scheme_code} not found and no department selected for new schemes.`);
          }
          
          await prisma.scheme.create({
            data: {
              scheme_code: validated.scheme_code,
              scheme_name: validated.scheme_name,
              total_budget_provision: validated.total_budget_provision,
              progressive_allotment: validated.progressive_allotment,
              actual_progressive_expenditure: validated.actual_progressive_expenditure_upto_dec,
              pct_budget_expenditure: validated.percent_budget_expenditure,
              pct_actual_expenditure: validated.percent_actual_expenditure,
              provisional_expenditure_current_month: validated.provisional_expenditure_current_month,
              department_id: deptId
            }
          });
          successCount++;
        }
      } catch (err: any) {
        errorCount++;
        const message = err instanceof z.ZodError 
          ? err.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
          : err.message;
        errors.push(`Row ${index + 2}: ${message}`);
      }
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "BULK_IMPORT_SCHEMES",
        module: "SCHEMES",
        details: { successCount, errorCount, deptId },
      },
    });

    return NextResponse.json({ 
      success: true, 
      successCount, 
      errorCount, 
      errors: errors.length > 5 ? [...errors.slice(0, 5), `...and ${errors.length - 5} more`] : errors
    });

  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json({ error: "Failed to import data" }, { status: 500 });
  }
}
