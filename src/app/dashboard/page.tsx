'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, FileText, Clock, TrendingUp, IndianRupee, History } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetStatsQuery, useGetMeQuery } from '@/store/services/api';
import { Progress } from '@/components/ui/progress';
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
  const { data, isLoading } = useGetStatsQuery();
  const { data: userData } = useGetMeQuery();
  const isAdmin = userData?.user?.role === 'ADMIN';
  
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

  const getStatDisplayName = (name: string) => {
    switch (name) {
      case 'Total Departments': return 'Total Departments';
      case 'Active Schemes': return 'Active Schemes';
      case 'Total Budget': return 'Total Budget';
      case 'Total Expenditure': return 'Total Expenditure';
      default: return name;
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="border-slate-200 dark:border-slate-800 shadow-sm">
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
            <Card key={stat.name} className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {getStatDisplayName(stat.name)}
                </CardTitle>
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                  {getIcon(stat.name)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{formatValue(stat)}</div>
                <div className="flex items-center mt-1 text-xs">
                  <span className={stat.changeType === 'increase' ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-500'}>
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

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Budget Utilization Card */}
        <Card className="flex flex-col border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center text-slate-900 dark:text-white">
              <TrendingUp className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-500" />
              Budget Utilization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-3 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overall Expenditure</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                      {(Number(budgetOverview?.percentage) || 0).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-slate-500">Target: </span>
                    <span className="font-bold text-slate-900 dark:text-white">100%</span>
                  </div>
                </div>
                <Progress 
                  value={budgetOverview?.percentage} 
                  className="h-3 bg-slate-100 dark:bg-slate-800" 
                  indicatorClassName="bg-gradient-to-r from-emerald-500 to-blue-600"
                />
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spent</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(budgetOverview?.totalExpenditure)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Remaining</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(budgetOverview?.totalBudget - budgetOverview?.totalExpenditure)}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {isAdmin && (
          <Card className="flex flex-col border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                <button className="flex flex-col items-center justify-center p-6 space-y-3 transition-all border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-blue-200 dark:hover:border-blue-900/30 hover:shadow-md group w-full h-full bg-white dark:bg-slate-900">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                    <Building2 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">Add Department</span>
                    <span className="text-[10px] text-slate-500 mt-1 block">Register a new office</span>
                  </div>
                </button>
                <button className="flex flex-col items-center justify-center p-6 space-y-3 transition-all border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-emerald-200 dark:hover:border-emerald-900/30 hover:shadow-md group w-full h-full bg-white dark:bg-slate-900">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                    <FileText className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">New Scheme</span>
                    <span className="text-[10px] text-slate-500 mt-1 block">Setup budget plan</span>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {isAdmin && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center text-slate-900 dark:text-white">
              <Clock className="w-5 h-5 mr-2 text-slate-400" />
              Recent Administrative Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)
              ) : activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 transition-all border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-800/30 hover:border-slate-200 dark:hover:border-slate-700">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                        <History className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{activity.action}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{activity.module} • {activity.user}</span>
                      </div>
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 shrink-0 self-end sm:self-center bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700 shadow-sm">
                      {new Date(activity.time).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-500 text-sm bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  No recent activity.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
