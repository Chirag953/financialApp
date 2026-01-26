'use client';

import { useState } from 'react';
import { useGetAuditLogsQuery } from '@/store/services/api';
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
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, History, User, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

export default function AuditLogsPage() {
  const t = useTranslations('AuditLogs');
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const limit = 25;

  const { data, isLoading, isFetching } = useGetAuditLogsQuery({ page, limit });

  const logs = data?.logs || [];
  const pagination = data?.pagination || { total: 0, totalPages: 0 };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/audit-logs/export');
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Audit_Logs_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-green-100 text-green-700 border-green-200';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={isExporting || logs.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          {t('exportExcel')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center">
            <History className="w-5 h-5 mr-2 text-gray-400" />
            {t('activityLog')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900">
                  <TableHead className="w-45">{t('timestamp')}</TableHead>
                  <TableHead className="w-37.5">{t('user')}</TableHead>
                  <TableHead className="w-37.5">{t('action')}</TableHead>
                  <TableHead className="w-30">{t('module')}</TableHead>
                  <TableHead>{t('details')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || isFetching ? (
                  Array(10).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : logs.length > 0 ? (
                  logs.map((log: any) => (
                    <TableRow key={log.id} className="hover:bg-slate-50">
                      <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="p-1 bg-slate-100 rounded-full">
                            <User className="w-3 h-3 text-slate-500" />
                          </div>
                          <span className="text-sm font-medium">{log.user?.name || t('system')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getActionColor(log.action)} font-mono text-[10px]`}>
                          {t.has(log.action) ? t(log.action) : log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium text-gray-600">{log.module || t('system')}</span>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-100 truncate text-xs text-gray-500" title={JSON.stringify(log.details)}>
                          {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                      {t('noLogs')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {isLoading || isFetching ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="border-slate-200">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : logs.length > 0 ? (
              logs.map((log: any) => (
                <Card key={log.id} className="border-slate-200 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-slate-100 rounded-full">
                          <User className="w-3 h-3 text-slate-500" />
                        </div>
                        <span className="text-sm font-semibold">{log.user?.name || t('system')}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`${getActionColor(log.action)} font-mono text-[10px]`}>
                        {t.has(log.action) ? t(log.action) : log.action}
                      </Badge>
                      <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {log.module || t('system')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                      <div className="font-medium text-[10px] text-slate-400 uppercase mb-1">{t('details')}</div>
                      <div className="line-clamp-2">
                        {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 text-right italic">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed">
                {t('noLogs')}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-2 py-4 border-t mt-4">
            <div className="text-sm text-gray-500">
              {t('showing')} <span className="font-medium">{(page - 1) * limit + 1}</span> {t('to')}{' '}
              <span className="font-medium">
                {Math.min(page * limit, pagination.total)}
              </span>{' '}
              {t('of')} <span className="font-medium">{pagination.total}</span> {t('logs')}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading || isFetching}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t('previous')}
              </Button>
              <div className="text-sm font-medium">
                {t('pageOf', { current: page, total: pagination.totalPages })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages || isLoading || isFetching}
              >
                {t('next')}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
