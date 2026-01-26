'use client';

import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, FileText, Download, ChevronLeft, ChevronRight, Filter, Pencil, Trash2, CheckSquare, Square } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from '@/components/ui/skeleton';
import { exportToExcel } from '@/lib/export';
import { 
  useGetSchemesQuery, 
  useGetDepartmentsQuery, 
  useDeleteSchemeMutation,
  useBulkDeleteSchemesMutation
} from '@/store/services/api';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { SchemeDialog } from '@/components/schemes/SchemeDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Scheme {
  id: string;
  scheme_code: string;
  scheme_name: string;
  total_budget_provision: number;
  progressive_allotment: number;
  actual_progressive_expenditure: number;
  pct_budget_expenditure: number;
  pct_actual_expenditure: number;
  provisional_expenditure_current_month: number;
  department: { 
    name: string;
    nameHn: string;
  };
}

export default function SchemesPage() {
  const t = useTranslations('Schemes');
  const tDept = useTranslations('Departments');
  const [search, setSearch] = useState('');
  const [deptId, setDeptId] = useState('all');
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [schemeToDelete, setSchemeToDelete] = useState<Scheme | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAllSelectedAcrossPages, setIsAllSelectedAcrossPages] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const limit = 25;

  const { data: schemesData, isLoading, isFetching } = useGetSchemesQuery({ 
    q: search, 
    deptId: deptId === 'all' ? '' : deptId,
    page, 
    limit 
  });

  const { data: deptsData } = useGetDepartmentsQuery({ limit: 100 });
  const [deleteScheme, { isLoading: isDeleting }] = useDeleteSchemeMutation();
  const [bulkDeleteSchemes, { isLoading: isBulkDeleting }] = useBulkDeleteSchemesMutation();

  const schemes = schemesData?.schemes || [];
  const pagination = schemesData?.pagination || { total: 0, totalPages: 0 };
  const departments = deptsData?.departments || [];

  const handleSelectAll = () => {
    if (isAllSelectedAcrossPages) {
      setIsAllSelectedAcrossPages(false);
      setSelectedIds([]);
    } else if (selectedIds.length === schemes.length && schemes.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(schemes.map((s: Scheme) => s.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (isAllSelectedAcrossPages) {
      setIsAllSelectedAcrossPages(false);
      setSelectedIds(schemes.map((s: Scheme) => s.id).filter((i: string) => i !== id));
    } else {
      setSelectedIds(prev => 
        prev.includes(id) ? prev.filter((i: string) => i !== id) : [...prev, id]
      );
    }
  };

  const handleBulkDelete = async () => {
    try {
      if (isAllSelectedAcrossPages) {
        await bulkDeleteSchemes({ 
          mode: 'all', 
          q: search, 
          deptId: deptId === 'all' ? '' : deptId 
        }).unwrap();
      } else {
        await bulkDeleteSchemes({ ids: selectedIds }).unwrap();
      }
      toast.success(t('deleteSuccess') || 'Schemes deleted successfully');
      setSelectedIds([]);
      setIsAllSelectedAcrossPages(false);
      setIsBulkDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.error || t('errorDeletingScheme') || 'Failed to delete schemes');
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        q: search,
        deptId: deptId === 'all' ? '' : deptId
      });
      
      const response = await fetch(`/api/schemes/export?${params.toString()}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Schemes_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleEdit = (scheme: Scheme) => {
    setSelectedScheme(scheme);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (scheme: Scheme) => {
    setSchemeToDelete(scheme);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!schemeToDelete) return;
    try {
      await deleteScheme(schemeToDelete.id).unwrap();
      toast.success(t('deleteSuccess') || 'Scheme deleted successfully');
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.error || t('errorDeletingScheme') || 'Failed to delete scheme');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex-1 sm:flex-none items-center" onClick={handleExport} disabled={isLoading || schemes.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            {t('exportExcel')}
          </Button>
          <Button className="flex-1 sm:flex-none items-center" onClick={() => { setSelectedScheme(null); setIsDialogOpen(true); }}>
            <FileText className="w-4 h-4 mr-2" />
            {t('newScheme')}
          </Button>
        </div>
      </div>

      <SchemeDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        scheme={selectedScheme}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteScheme') || 'Delete Scheme'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteScheme') || 'Are you sure you want to delete this scheme? This action cannot be undone.'}
            </AlertDialogDescription>
            <div className="mt-2 p-3 bg-slate-50 rounded border text-slate-900 font-medium">
              {schemeToDelete?.scheme_code} - {schemeToDelete?.scheme_name}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tDept('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? tDept('saving') : tDept('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteScheme') || 'Delete Schemes'}</AlertDialogTitle>
            <AlertDialogDescription>
              {tDept('confirmBulkDelete', { count: isAllSelectedAcrossPages ? pagination.total : selectedIds.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tDept('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? tDept('saving') : tDept('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="text-lg font-medium">{t('listTitle')}</CardTitle>
              {(selectedIds.length > 0 || isAllSelectedAcrossPages) && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                  <span className="text-sm text-slate-500 font-medium">
                    {isAllSelectedAcrossPages ? pagination.total : selectedIds.length} {tDept('selected')}
                  </span>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="h-8"
                    onClick={() => setIsBulkDeleteDialogOpen(true)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    {tDept('deleteSelected')}
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={deptId} onValueChange={(val) => { setDeptId(val); setPage(1); }}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2 text-gray-400" />
                    <SelectValue placeholder={t('allDepartments')} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allDepartments')}</SelectItem>
                  {departments.map((dept: any) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Selection Banner */}
          {!isLoading && selectedIds.length === schemes.length && schemes.length > 0 && pagination.total > schemes.length && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-100 rounded-md flex items-center justify-center gap-2 text-sm text-blue-700 animate-in fade-in slide-in-from-top-1">
              {isAllSelectedAcrossPages ? (
                <>
                  <span>{tDept('allSelectedAcrossPages', { total: pagination.total })}</span>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-blue-800 font-bold" 
                    onClick={() => { setIsAllSelectedAcrossPages(false); setSelectedIds([]); }}
                  >
                    {tDept('clearSelection')}
                  </Button>
                </>
              ) : (
                <>
                  <span>{tDept('selectedAllOnPage', { count: schemes.length })}</span>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-blue-800 font-bold" 
                    onClick={() => setIsAllSelectedAcrossPages(true)}
                  >
                    {tDept('selectAllAcrossPages', { total: pagination.total })}
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Desktop Table View - Hidden on Mobile */}
          <div className="hidden lg:block rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900">
                  <TableHead className="w-10">
                    <Checkbox 
                      checked={isAllSelectedAcrossPages || (selectedIds.length === schemes.length && schemes.length > 0)}
                      onCheckedChange={handleSelectAll}
                      aria-label={tDept('selectAll')}
                    />
                  </TableHead>
                  <TableHead className="w-30">{t('code')}</TableHead>
                  <TableHead className="min-w-50">{t('name')}</TableHead>
                  <TableHead className="text-right">{t('totalBudget')}</TableHead>
                  <TableHead className="text-right">{t('allotment')}</TableHead>
                  <TableHead className="text-right">{t('expenditure')}</TableHead>
                  <TableHead className="text-right">{t('pctBudget')}</TableHead>
                  <TableHead className="text-right">{t('pctActual')}</TableHead>
                  <TableHead className="text-right">{t('provExp')}</TableHead>
                  <TableHead className="text-right">{tDept('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || isFetching ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      {Array(9).fill(0).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : schemes.length > 0 ? (
                  schemes.map((scheme: Scheme) => (
                    <TableRow key={scheme.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${(isAllSelectedAcrossPages || selectedIds.includes(scheme.id)) ? 'bg-slate-50/50 dark:bg-slate-800/50' : ''}`}>
                      <TableCell>
                        <Checkbox 
                          checked={isAllSelectedAcrossPages || selectedIds.includes(scheme.id)}
                          onCheckedChange={() => handleSelectOne(scheme.id)}
                          aria-label={`Select ${scheme.scheme_name}`}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">{scheme.scheme_code}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{scheme.scheme_name}</span>
                          <span className="text-[10px] text-gray-400">{scheme.department.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-xs font-medium">{formatCurrency(scheme.total_budget_provision)}</TableCell>
                      <TableCell className="text-right text-xs">{formatCurrency(scheme.progressive_allotment)}</TableCell>
                      <TableCell className="text-right text-xs font-bold text-blue-600">{formatCurrency(scheme.actual_progressive_expenditure)}</TableCell>
                      <TableCell className="text-right">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          (Number(scheme.pct_budget_expenditure) || 0) > 90 ? 'bg-red-100 text-red-700' : 
                          (Number(scheme.pct_budget_expenditure) || 0) > 50 ? 'bg-orange-100 text-orange-700' : 
                          'bg-green-100 text-green-700'
                        }`}>
                          {(Number(scheme.pct_budget_expenditure) || 0).toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          (Number(scheme.pct_actual_expenditure) || 0) > 90 ? 'bg-red-100 text-red-700' : 
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {(Number(scheme.pct_actual_expenditure) || 0).toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-xs">{formatCurrency(scheme.provisional_expenditure_current_month)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20" 
                            title={tDept('edit')}
                            onClick={() => handleEdit(scheme)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" 
                            title={tDept('delete')}
                            onClick={() => handleDeleteClick(scheme)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-10 text-gray-500">
                      {t('noSchemes')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Stacked Card View - Visible on Mobile */}
          <div className="lg:hidden space-y-4">
            {isLoading || isFetching ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="p-4 border dark:border-slate-800 rounded-lg space-y-3">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))
            ) : schemes.length > 0 ? (
              schemes.map((scheme: Scheme) => (
                <div key={scheme.id} className={`p-4 border dark:border-slate-800 rounded-lg space-y-3 bg-white dark:bg-slate-900 hover:border-primary/50 transition-colors shadow-sm ${(isAllSelectedAcrossPages || selectedIds.includes(scheme.id)) ? 'bg-slate-50 border-blue-200' : ''}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        checked={isAllSelectedAcrossPages || selectedIds.includes(scheme.id)}
                        onCheckedChange={() => handleSelectOne(scheme.id)}
                      />
                      <div className="font-mono text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                        {scheme.scheme_code}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20" 
                          onClick={() => handleEdit(scheme)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" 
                          onClick={() => handleDeleteClick(scheme)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        (Number(scheme.pct_budget_expenditure) || 0) > 90 ? 'bg-red-100 text-red-700' : 
                        (Number(scheme.pct_budget_expenditure) || 0) > 50 ? 'bg-orange-100 text-orange-700' : 
                        'bg-green-100 text-green-700'
                      }`}>
                        B: {(Number(scheme.pct_budget_expenditure) || 0).toFixed(1)}%
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        (Number(scheme.pct_actual_expenditure) || 0) > 90 ? 'bg-red-100 text-red-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        A: {(Number(scheme.pct_actual_expenditure) || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900 leading-tight">{scheme.scheme_name}</h3>
                    <p className="text-[10px] text-gray-400 mt-1">{scheme.department.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">{t('totalBudget')}</p>
                      <p className="text-xs font-semibold">{formatCurrency(scheme.total_budget_provision)}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">{t('expenditure')}</p>
                      <p className="text-xs font-bold text-blue-600">{formatCurrency(scheme.actual_progressive_expenditure)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">{t('allotment')}</p>
                      <p className="text-xs">{formatCurrency(scheme.progressive_allotment)}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">{t('provExp')}</p>
                      <p className="text-xs">{formatCurrency(scheme.provisional_expenditure_current_month)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500 border rounded-lg">
                {t('noSchemes')}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 text-center sm:text-left">
              {tDept('showing')} <span className="font-medium">{(page - 1) * limit + 1}</span> {tDept('to')}{' '}
              <span className="font-medium">
                {Math.min(page * limit, pagination.total)}
              </span>{' '}
              {tDept('of')} <span className="font-medium">{pagination.total}</span> {t('title').toLowerCase()}
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                className="flex-1 sm:flex-none h-8 px-3"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {tDept('previous')}
              </Button>
              <div className="text-sm font-medium min-w-[100px] text-center">
                {tDept('page')} {page} {tDept('of')} {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages || isLoading}
                className="flex-1 sm:flex-none h-8 px-3"
              >
                {tDept('next')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
