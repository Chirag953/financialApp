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
import { Search, Building2, Download, ChevronLeft, ChevronRight, Eye, Pencil, Trash2, CheckSquare, Square } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from '@/components/ui/skeleton';
import { exportToExcel } from '@/lib/export';
import { 
  useGetDepartmentsQuery, 
  useDeleteDepartmentMutation,
  useBulkDeleteDepartmentsMutation 
} from '@/store/services/api';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { DepartmentDialog } from '@/components/departments/DepartmentDialog';
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

interface Department {
  id: string;
  name: string;
  nameHn: string;
}

export default function DepartmentsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAllSelectedAcrossPages, setIsAllSelectedAcrossPages] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const limit = 25;
  const t = useTranslations('Departments');

  const { data, isLoading, isFetching } = useGetDepartmentsQuery({ 
    q: search, 
    page, 
    limit 
  });

  const [deleteDepartment, { isLoading: isDeleting }] = useDeleteDepartmentMutation();
  const [bulkDeleteDepartments, { isLoading: isBulkDeleting }] = useBulkDeleteDepartmentsMutation();

  const departments = data?.departments || [];
  const pagination = data?.pagination || { total: 0, totalPages: 0 };

  const handleSelectAll = () => {
    if (isAllSelectedAcrossPages) {
      setIsAllSelectedAcrossPages(false);
      setSelectedIds([]);
    } else if (selectedIds.length === departments.length && departments.length > 0) {
      // If already all on current page are selected, but not all across pages
      // and user clicks header checkbox again, clear all
      setSelectedIds([]);
    } else {
      setSelectedIds(departments.map((d: Department) => d.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (isAllSelectedAcrossPages) {
      // If we were in "select all across pages" mode and unselect one,
      // we need to switch to manual mode. But we don't have all IDs.
      // For simplicity, we'll just clear the "all across pages" flag
      // and keep the current page's IDs except this one.
      setIsAllSelectedAcrossPages(false);
      setSelectedIds(departments.map((d: Department) => d.id).filter((i: string) => i !== id));
    } else {
      setSelectedIds(prev => 
        prev.includes(id) ? prev.filter((i: string) => i !== id) : [...prev, id]
      );
    }
  };

  const handleBulkDelete = async () => {
    try {
      if (isAllSelectedAcrossPages) {
        await bulkDeleteDepartments({ mode: 'all', q: search }).unwrap();
      } else {
        await bulkDeleteDepartments({ ids: selectedIds }).unwrap();
      }
      toast.success(t('deleteSuccess'));
      setSelectedIds([]);
      setIsAllSelectedAcrossPages(false);
      setIsBulkDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.error || t('errorDeletingDept'));
    }
  };

  const handleExport = () => {
    const exportData = departments.map((d: Department, i: number) => ({
      [t('sNo')]: (page - 1) * limit + i + 1,
      [t('nameEn')]: d.name,
      [t('nameHn')]: d.nameHn,
    }));
    exportToExcel(exportData, 'Departments_List');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleEdit = (dept: Department) => {
    setSelectedDept(dept);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (dept: Department) => {
    setDeptToDelete(dept);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deptToDelete) return;
    try {
      await deleteDepartment(deptToDelete.id).unwrap();
      toast.success(t('deleteSuccess'));
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.error || t('errorDeletingDept'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex-1 sm:flex-none items-center" onClick={handleExport} disabled={isLoading || departments.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            {t('exportExcel')}
          </Button>
          <Button className="flex-1 sm:flex-none items-center" onClick={() => { setSelectedDept(null); setIsDialogOpen(true); }}>
            <Building2 className="w-4 h-4 mr-2" />
            {t('addDept')}
          </Button>
        </div>
      </div>

      <DepartmentDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        department={selectedDept}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDept')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteDept')}
            </AlertDialogDescription>
            <div className="mt-2 p-3 bg-slate-50 rounded border text-slate-900 font-medium">
              {deptToDelete?.name}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? t('saving') : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDept')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmBulkDelete', { count: isAllSelectedAcrossPages ? pagination.total : selectedIds.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? t('saving') : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <CardTitle className="text-lg font-medium">{t('listTitle')}</CardTitle>
              {(selectedIds.length > 0 || isAllSelectedAcrossPages) && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                  <span className="text-sm text-slate-500 font-medium">
                    {isAllSelectedAcrossPages ? pagination.total : selectedIds.length} {t('selected')}
                  </span>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="h-8"
                    onClick={() => setIsBulkDeleteDialogOpen(true)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    {t('deleteSelected')}
                  </Button>
                </div>
              )}
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Selection Banner */}
          {!isLoading && selectedIds.length === departments.length && departments.length > 0 && pagination.total > departments.length && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-100 rounded-md flex items-center justify-center gap-2 text-sm text-blue-700 animate-in fade-in slide-in-from-top-1">
              {isAllSelectedAcrossPages ? (
                <>
                  <span>{t('allSelectedAcrossPages', { total: pagination.total })}</span>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-blue-800 font-bold" 
                    onClick={() => { setIsAllSelectedAcrossPages(false); setSelectedIds([]); }}
                  >
                    {t('clearSelection')}
                  </Button>
                </>
              ) : (
                <>
                  <span>{t('selectedAllOnPage', { count: departments.length })}</span>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-blue-800 font-bold" 
                    onClick={() => setIsAllSelectedAcrossPages(true)}
                  >
                    {t('selectAllAcrossPages', { total: pagination.total })}
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900">
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={isAllSelectedAcrossPages || (selectedIds.length === departments.length && departments.length > 0)}
                      onCheckedChange={handleSelectAll}
                      aria-label={t('selectAll')}
                    />
                  </TableHead>
                  <TableHead className="w-20">{t('sNo')}</TableHead>
                  <TableHead>{t('nameEn')}</TableHead>
                  <TableHead>{t('nameHn')}</TableHead>
                  <TableHead className="text-right w-40">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || isFetching ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : departments.length > 0 ? (
                  departments.map((dept: Department, index: number) => (
                    <TableRow key={dept.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${(isAllSelectedAcrossPages || selectedIds.includes(dept.id)) ? 'bg-slate-50/50 dark:bg-slate-800/50' : ''}`}>
                      <TableCell>
                        <Checkbox 
                          checked={isAllSelectedAcrossPages || selectedIds.includes(dept.id)}
                          onCheckedChange={() => handleSelectOne(dept.id)}
                          aria-label={`Select ${dept.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-gray-500">{(page - 1) * limit + index + 1}</TableCell>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell className="text-slate-600 font-hindi">{dept.nameHn}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Link href={`/dashboard/departments/${dept.id}` as any}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20" title={t('viewDetails')}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20" 
                            title={t('edit')}
                            onClick={() => handleEdit(dept)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" 
                            title={t('delete')}
                            onClick={() => handleDeleteClick(dept)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {t('noDepartments')}
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
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                    <div className="pt-2 flex justify-end">
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : departments.length > 0 ? (
              departments.map((dept: Department, index: number) => (
                <Card key={dept.id} className={`border-slate-200 hover:border-primary/30 transition-colors ${(isAllSelectedAcrossPages || selectedIds.includes(dept.id)) ? 'bg-slate-50 border-blue-200' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={isAllSelectedAcrossPages || selectedIds.includes(dept.id)}
                          onCheckedChange={() => handleSelectOne(dept.id)}
                        />
                        <span className="text-xs font-medium text-slate-400">#{(page - 1) * limit + index + 1}</span>
                      </div>
                      <div className="flex space-x-1">
                        <Link href={`/dashboard/departments/${dept.id}` as any}>
                          <Button variant="outline" size="sm" className="h-8 px-2">
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            {t('viewDetails')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">{dept.name}</h3>
                    <p className="text-sm text-slate-600 font-hindi mb-4">{dept.nameHn}</p>
                    <div className="flex justify-end border-t pt-3 space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-amber-600 h-8 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                        onClick={() => handleEdit(dept)}
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1.5" />
                        {t('edit')}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 h-8 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDeleteClick(dept)}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        {t('delete')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed">
                {t('noDepartments')}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 border-t gap-4">
            <div className="text-sm text-gray-500 text-center sm:text-left">
              {t('showing')} <span className="font-medium">{(page - 1) * limit + 1}</span> {t('to')}{' '}
              <span className="font-medium">
                {Math.min(page * limit, pagination.total)}
              </span>{' '}
              {t('of')} <span className="font-medium">{pagination.total}</span> {t('title').toLowerCase()}
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading || isFetching}
                className="flex-1 sm:flex-none"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t('previous')}
              </Button>
              <div className="text-sm font-medium min-w-[100px] text-center">
                {t('page')} {page} {t('of')} {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages || isLoading || isFetching}
                className="flex-1 sm:flex-none"
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
