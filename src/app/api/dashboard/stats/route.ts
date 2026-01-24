import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        schemes: true,
      },
    });

    const categories = await prisma.category.findMany();
    
    const departmentCount = departments.length;
    const schemeCount = departments.reduce((sum: number, dept: any) => sum + dept.schemes.length, 0);
    const categoryCount = categories.length;
    
    // Calculate total budget, allotment, and expenditure
    const totalBudget = departments.reduce((sum: number, dept: any) => 
      sum + dept.schemes.reduce((dSum: number, scheme: any) => dSum + Number(scheme.total_budget_provision || 0), 0), 0);
    
    const totalAllotment = departments.reduce((sum: number, dept: any) => 
      sum + dept.schemes.reduce((dSum: number, scheme: any) => dSum + Number(scheme.progressive_allotment || 0), 0), 0);
      
    const totalExpenditure = departments.reduce((sum: number, dept: any) => 
      sum + dept.schemes.reduce((dSum: number, scheme: any) => dSum + Number(scheme.actual_progressive_expenditure_upto_month || 0), 0), 0);

    // Calculate mapping progress (mock logic for now as mapping is complex)
    const mappingProgress = 45; // 45% mapped

    // Calculate top departments by budget
    const topDepartments = departments
      .map((dept: any) => ({
        name: dept.name,
        budget: dept.schemes.reduce((sum: number, s: any) => sum + Number(s.total_budget_provision || 0), 0),
        spent: dept.schemes.reduce((sum: number, s: any) => sum + Number(s.actual_progressive_expenditure_upto_month || 0), 0)
      }))
      .sort((a: any, b: any) => b.budget - a.budget)
      .slice(0, 5);

    // MOCK DATA for now since we don't have direct budget linkage in Prisma schema for categories yet
    // In a real app, we would aggregate this from the database
    const budgetByCategory = [
      { name: 'General', value: totalBudget * 0.6 },
      { name: 'SC/ST', value: totalBudget * 0.25 },
      { name: 'OBC', value: totalBudget * 0.15 },
    ];

    // Mock recent audit logs for now
    const recentActivity = await (prisma.auditLog as any).findMany({
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
