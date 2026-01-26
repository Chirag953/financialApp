'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, FileText, Tags, Map as MapIcon, Clock, TrendingUp, IndianRupee } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetStatsQuery } from '@/store/services/api';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from 'next-intl';
import { DashboardCharts } from '@/components/dashboard/Charts';

interface Stat {
  name: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  isCurrency?: boolean;
}

interface Activity {
  id: string;
  user: string;
  action: string;
  module: string;
  time: string;
}

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const { data, isLoading } = useGetStatsQuery();
  
  const stats: Stat[] = data?.stats || [];
  const activities: Activity[] = data?.recentActivity || [];
  const budgetOverview = data?.budgetOverview;

  const formatValue = (stat: Stat) => {
    if (stat.isCurrency) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(Number(stat.value));
    }
    return stat.value;
  };

  const getStatTranslationKey = (name: string) => {
    switch (name) {
      case 'Total Departments': return 'totalDepartments';
      case 'Active Schemes': return 'activeSchemes';
      case 'Total Budget': return 'totalBudget';
      case 'Total Expenditure': return 'totalExpenditure';
      default: return '';
    }
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Total Departments': return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'Active Schemes': return <FileText className="w-5 h-5 text-green-600" />;
      case 'Total Budget': return <IndianRupee className="w-5 h-5 text-purple-600" />;
      case 'Total Expenditure': return <TrendingUp className="w-5 h-5 text-orange-600" />;
      default: return <Building2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('welcome')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          stats.map((stat) => (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  {getStatTranslationKey(stat.name) ? t(getStatTranslationKey(stat.name)) : stat.name}
                </CardTitle>
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  {getIcon(stat.name)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{formatValue(stat)}</div>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <span className={stat.changeType === 'increase' ? 'text-green-600 font-medium' : 'text-gray-500'}>
                    {stat.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {!isLoading && data && (
        <DashboardCharts 
          topDepartments={data.topDepartments || []} 
          budgetByCategory={data.budgetByCategory || []} 
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Budget Utilization Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              {t('budgetUtilization')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-gray-500">{t('overallExpenditure')}</p>
                    <p className="text-2xl font-bold text-primary">
                      {(Number(budgetOverview?.percentage) || 0).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <span className="text-gray-500">Target: </span>
                    <span className="font-medium">100%</span>
                  </div>
                </div>
                <Progress value={budgetOverview?.percentage} className="h-3" />
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{t('spent')}</p>
                    <p className="text-sm font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(budgetOverview?.totalExpenditure)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{t('remaining')}</p>
                    <p className="text-sm font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(budgetOverview?.totalBudget - budgetOverview?.totalExpenditure)}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t('quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-4 space-y-2 transition-colors border rounded-xl hover:bg-slate-50">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium">{t('addDept')}</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 space-y-2 transition-colors border rounded-xl hover:bg-slate-50">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm font-medium">{t('newScheme')}</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-500" />
            {t('recentActivity')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 transition-colors border rounded-lg hover:bg-slate-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{activity.action}</span>
                      <span className="text-xs text-gray-500">{activity.module} • {activity.user}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(activity.time).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm">{t('noActivity')}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
