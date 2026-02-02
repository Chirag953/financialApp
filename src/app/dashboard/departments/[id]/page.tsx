'use client';

import { useParams } from 'next/navigation';
import { useGetDepartmentByIdQuery } from '@/store/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Building2, FileText, IndianRupee, TrendingUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DepartmentDetailPage() {
  const { id } = useParams();
  const { data: department, isLoading, error } = useGetDepartmentByIdQuery(id as string);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <p className="text-red-500 font-medium">Failed to load department details</p>
        <Link href="/dashboard/departments">
          <Button variant="outline">Back to Departments</Button>
        </Link>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/departments">
            <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-64" />
            ) : (
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-6 h-6 text-emerald-600" />
                {department?.name}
              </h1>
            )}
            {isLoading ? (
              <Skeleton className="h-4 w-32 mt-1" />
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {department?.summary.schemeCount} active schemes
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Budget</CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <IndianRupee className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {isLoading ? <Skeleton className="h-7 w-24" /> : formatCurrency(department?.summary.totalBudget)}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Allotment</CardTitle>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {isLoading ? <Skeleton className="h-7 w-24" /> : formatCurrency(department?.summary.totalAllotment)}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Expenditure</CardTitle>
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <TrendingUp className="w-4 h-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {isLoading ? <Skeleton className="h-7 w-24" /> : formatCurrency(department?.summary.totalExpenditure)}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Utilization %</CardTitle>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {isLoading ? <Skeleton className="h-7 w-16" /> : `${(Number(department?.summary.utilizationPercentage) || 0).toFixed(1)}%`}
            </div>
            {!isLoading && <Progress value={department?.summary.utilizationPercentage} className="h-1.5" />}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Department Schemes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <TableHead className="w-32 font-semibold text-slate-900 dark:text-slate-200">Scheme Code</TableHead>
                  <TableHead className="min-w-60 font-semibold text-slate-900 dark:text-slate-200">Scheme Name</TableHead>
                  <TableHead className="text-right font-semibold text-slate-900 dark:text-slate-200">Budget</TableHead>
                  <TableHead className="text-right font-semibold text-slate-900 dark:text-slate-200">Allotment</TableHead>
                  <TableHead className="text-right font-semibold text-slate-900 dark:text-slate-200">Expenditure</TableHead>
                  <TableHead className="text-right font-semibold text-slate-900 dark:text-slate-200">% Budget</TableHead>
                  <TableHead className="text-right font-semibold text-slate-900 dark:text-slate-200">% Actual</TableHead>
                  <TableHead className="text-right font-semibold text-slate-900 dark:text-slate-200">Prov. Exp.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : department?.schemes.length > 0 ? (
                  department.schemes.map((scheme: any) => (
                    <TableRow key={scheme.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">{scheme.scheme_code}</TableCell>
                      <TableCell className="font-medium text-sm text-slate-900 dark:text-slate-200">{scheme.scheme_name}</TableCell>
                      <TableCell className="text-right text-xs text-slate-600 dark:text-slate-400">{formatCurrency(Number(scheme.total_budget_provision))}</TableCell>
                      <TableCell className="text-right text-xs text-slate-600 dark:text-slate-400">{formatCurrency(Number(scheme.progressive_allotment))}</TableCell>
                      <TableCell className="text-right text-xs font-bold text-emerald-600">{formatCurrency(Number(scheme.actual_progressive_expenditure))}</TableCell>
                      <TableCell className="text-right">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          (Number(scheme.pct_budget_expenditure) || 0) > 90 ? 'bg-red-100 text-red-700' : 
                          (Number(scheme.pct_budget_expenditure) || 0) > 50 ? 'bg-orange-100 text-orange-700' : 
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {(Number(scheme.pct_budget_expenditure) || 0).toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          (Number(scheme.pct_actual_expenditure) || 0) > 90 ? 'bg-red-100 text-red-700' : 
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {(Number(scheme.pct_actual_expenditure) || 0).toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-600 dark:text-slate-400">{formatCurrency(Number(scheme.provisional_expenditure_current_month))}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-slate-500 dark:text-slate-400">
                      No schemes found for this department.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
