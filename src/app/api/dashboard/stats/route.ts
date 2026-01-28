import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        schemes: true,
      },
    });

    const categories = await prisma.category.findMany({
      include: {
        mappings: {
          include: {
            scheme: true
          }
        }
      }
    });
    
    const departmentCount = departments.length;
    const schemeCount = departments.reduce((sum: number, dept: any) => sum + dept.schemes.length, 0);
    
    // Calculate total budget and expenditure
    const totalBudget = departments.reduce((sum: number, dept: any) => 
      sum + dept.schemes.reduce((dSum: number, scheme: any) => dSum + Number(scheme.total_budget_provision || 0), 0), 0);
    
    const totalExpenditure = departments.reduce((sum: number, dept: any) => 
      sum + dept.schemes.reduce((dSum: number, scheme: any) => dSum + Number(scheme.actual_progressive_expenditure || 0), 0), 0);

    // Calculate top departments by budget
    const topDepartments = departments
      .map((dept: any) => ({
        name: dept.name,
        budget: dept.schemes.reduce((sum: number, s: any) => sum + Number(s.total_budget_provision || 0), 0),
        spent: dept.schemes.reduce((sum: number, s: any) => sum + Number(s.actual_progressive_expenditure || 0), 0)
      }))
      .sort((a: any, b: any) => b.budget - a.budget)
      .slice(0, 5);

    // Calculate real budget by category from mappings
    const budgetByCategory = categories.map(cat => ({
      name: cat.name,
      value: cat.mappings.reduce((sum, m) => sum + Number(m.scheme.total_budget_provision || 0), 0)
    })).filter(cat => cat.value > 0);

    // If no mappings exist yet, provide a fallback or empty array
    if (budgetByCategory.length === 0) {
      budgetByCategory.push({ name: 'Uncategorized', value: totalBudget });
    }

    // Mock recent audit logs for now
    const recentActivity = await prisma.auditLog.findMany({
      take: 5,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { name: true } } }
    });

    return NextResponse.json({
      stats: [
        { name: 'Total Departments', value: departmentCount, change: '+0', changeType: 'neutral' },
        { name: 'Active Schemes', value: schemeCount, change: '+0', changeType: 'neutral' },
        { name: 'Total Budget', value: totalBudget, change: 'All Schemes', changeType: 'neutral', isCurrency: true },
        { name: 'Total Expenditure', value: totalExpenditure, change: 'All Schemes', changeType: 'neutral', isCurrency: true },
      ],
      budgetOverview: {
        totalBudget,
        totalExpenditure,
        percentage: totalBudget > 0 ? (totalExpenditure / totalBudget) * 100 : 0
      },
      topDepartments,
      budgetByCategory,
      recentActivity: recentActivity.map((log: any) => ({
        id: log.id,
        user: log.user?.name || 'System',
        action: log.action,
        module: log.module || 'System',
        time: log.timestamp.toISOString(),
      }))
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

