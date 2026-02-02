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

export default function AuditLogsPage() {
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
    if (action.includes('CREATE')) return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Audit Logs</h1>
          <p className="text-slate-500 dark:text-slate-400">View and track system activities and changes</p>
        </div>
        <Button 
          onClick={handleExport} 
          disabled={isExporting || logs.length === 0} 
          className="w-full sm:w-auto justify-center h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
        >
          {isExporting ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Download Excel
        </Button>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <CardTitle className="text-lg font-semibold flex items-center text-slate-800 dark:text-slate-200">
            <History className="w-5 h-5 mr-2 text-emerald-500" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                    <TableHead className="w-[180px] text-slate-900 dark:text-slate-100 font-semibold">Timestamp</TableHead>
                    <TableHead className="w-[150px] text-slate-900 dark:text-slate-100 font-semibold">User</TableHead>
                    <TableHead className="w-[150px] text-slate-900 dark:text-slate-100 font-semibold">Action</TableHead>
                    <TableHead className="w-[120px] text-slate-900 dark:text-slate-100 font-semibold">Module</TableHead>
                    <TableHead className="text-slate-900 dark:text-slate-100 font-semibold">Details</TableHead>
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
                      <TableRow key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800">
                        <TableCell className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                              <User className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{log.user?.name || "System"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${getActionColor(log.action)} font-mono text-[10px] px-2 py-0.5 rounded-md`}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded uppercase tracking-wider">
                            {log.module || "System"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[400px] truncate text-xs text-slate-500 dark:text-slate-400 font-medium" title={JSON.stringify(log.details)}>
                            {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <History className="w-8 h-8 text-slate-300" />
                          <p>No activity logs found.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 p-4">
            {isLoading || isFetching ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="border-slate-200 shadow-sm">
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
                <Card key={log.id} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-all duration-200 group">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                          <User className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{log.user?.name || "System"}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`${getActionColor(log.action)} font-mono text-[10px] px-2 py-0.5`}>
                        {log.action}
                      </Badge>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700 uppercase">
                        {log.module || "System"}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-colors">
                      <div className="font-bold text-[10px] text-slate-400 dark:text-slate-500 uppercase mb-1.5 tracking-wider">Details</div>
                      <div className="line-clamp-3 leading-relaxed">
                        {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                      <div className="h-px flex-1 mx-3 bg-slate-100 dark:bg-slate-800" />
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        #{log.id.slice(-6)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-medium">No activity logs found.</p>
                <p className="text-xs text-slate-400 mt-1">Activities will appear here once they occur.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t border-slate-100 dark:border-slate-800 gap-4 mt-auto bg-slate-50/30 dark:bg-slate-900/30 rounded-b-lg">
            <div className="text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left order-2 sm:order-1">
              Showing <span className="font-semibold text-slate-900 dark:text-slate-200">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-semibold text-slate-900 dark:text-slate-200">
                {Math.min(page * limit, pagination.total)}
              </span>{' '}
              of <span className="font-semibold text-slate-900 dark:text-slate-200">{pagination.total}</span> logs
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-end order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading || isFetching}
                className="flex-1 sm:flex-none h-9 px-4 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 mr-1.5" />
                Previous
              </Button>
              <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-md text-sm font-bold min-w-[100px] text-center shadow-sm text-emerald-700 dark:text-emerald-400">
                Page {page} of {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages || isLoading || isFetching}
                className="flex-1 sm:flex-none h-9 px-4 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 shadow-sm"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

