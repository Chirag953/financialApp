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
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function DepartmentDetailPage() {
  const t = useTranslations('DeptDetails');
  const { id } = useParams();
  const { data: department, isLoading, error } = useGetDepartmentByIdQuery(id as string);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <p className="text-red-500 font-medium">{t('failedLoad')}</p>
        <Link href="/dashboard/departments">
          <Button variant="outline">{t('backToDepts')}</Button>
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
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-64" />
            ) : (
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                {department?.name}
              </h1>
            )}
            {isLoading ? (
              <Skeleton className="h-4 w-32 mt-1" />
            ) : (
              <p className="text-sm text-gray-500">
                {t('activeSchemes', { count: department?.summary.schemeCount })}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t('totalBudget')}</CardTitle>
            <IndianRupee className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {isLoading ? <Skeleton className="h-7 w-24" /> : formatCurrency(department?.summary.totalBudget)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t('totalAllotment')}</CardTitle>
            <FileText className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {isLoading ? <Skeleton className="h-7 w-24" /> : formatCurrency(department?.summary.totalAllotment)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t('totalExpenditure')}</CardTitle>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {isLoading ? <Skeleton className="h-7 w-24" /> : formatCurrency(department?.summary.totalExpenditure)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t('utilization')}</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xl font-bold">
              {isLoading ? <Skeleton className="h-7 w-16" /> : `${(Number(department?.summary.utilizationPercentage) || 0).toFixed(1)}%`}
            </div>
            {!isLoading && <Progress value={department?.summary.utilizationPercentage} className="h-1.5" />}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('deptSchemes')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-32">{t('schemeCode')}</TableHead>
                  <TableHead className="min-w-60">{t('schemeName')}</TableHead>
                  <TableHead className="text-right">{t('budget')}</TableHead>
                  <TableHead className="text-right">{t('allotment')}</TableHead>
                  <TableHead className="text-right">{t('expenditure')}</TableHead>
                  <TableHead className="text-right">{t('pctUtil')}</TableHead>
                  <TableHead className="text-right">{t('pctActual')}</TableHead>
                  <TableHead className="text-right">{t('provExp')}</TableHead>
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
                    <TableRow key={scheme.id}>
                      <TableCell className="font-mono text-xs">{scheme.scheme_code}</TableCell>
                      <TableCell className="font-medium text-sm">{scheme.scheme_name}</TableCell>
                      <TableCell className="text-right text-xs">{formatCurrency(Number(scheme.total_budget_provision))}</TableCell>
                      <TableCell className="text-right text-xs">{formatCurrency(Number(scheme.progressive_allotment))}</TableCell>
                      <TableCell className="text-right text-xs font-bold text-blue-600">{formatCurrency(Number(scheme.actual_progressive_expenditure))}</TableCell>
                      <TableCell className="text-right">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          (Number(scheme.pct_budget_expenditure) || 0) > 90 ? 'bg-red-100 text-red-700' : 
                          (Number(scheme.pct_budget_expenditure) || 0) > 50 ? 'bg-orange-100 text-orange-700' : 
                          'bg-green-100 text-green-700'
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
                      <TableCell className="text-right text-xs">{formatCurrency(Number(scheme.provisional_expenditure_current_month))}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-gray-500">
                      {t('noSchemes')}
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
