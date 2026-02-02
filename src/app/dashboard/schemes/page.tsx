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
import { Search, FileText, Download, ChevronLeft, ChevronRight, Filter, Pencil, Trash2, CheckSquare, Square, Upload, ChevronDown } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  useGetSchemesQuery, 
  useGetDepartmentsQuery, 
  useDeleteSchemeMutation,
  useBulkDeleteSchemesMutation,
  useGetSettingsQuery,
  useGetMeQuery
} from '@/store/services/api';
import Link from 'next/link';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { SchemeDialog } from '@/components/schemes/SchemeDialog';
import { BulkImportExportDialog } from '@/components/schemes/BulkImportExportDialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  mappings?: Array<{
    category: {
      name: string;
    };
    part?: {
      part_name: string;
    };
  }>;
}

export default function SchemesPage() {
  const [search, setSearch] = useState('');
  const [deptId, setDeptId] = useState('all');
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkImportExportOpen, setIsBulkImportExportOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [schemeToDelete, setSchemeToDelete] = useState<Scheme | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAllSelectedAcrossPages, setIsAllSelectedAcrossPages] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const limit = 25;

  const { data: settingsData } = useGetSettingsQuery();
  const { data: userData } = useGetMeQuery();
  const isAdmin = userData?.user?.role === 'ADMIN';

  const { data: schemesData, isLoading, isFetching } = useGetSchemesQuery({ 
    q: search, 
    deptId: deptId === 'all' ? '' : deptId,
    financialYear: settingsData?.settings?.financial_year || '',
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
      return;
    }

    const allOnPageIds = schemes.map((s: Scheme) => s.id);
    const areAllOnPageSelected = allOnPageIds.length > 0 && allOnPageIds.every((id: string) => selectedIds.includes(id));

    if (areAllOnPageSelected) {
      // Unselect all on current page
      setSelectedIds(prev => prev.filter((id: string) => !allOnPageIds.includes(id)));
    } else {
      // Select all on current page
      setSelectedIds(prev => {
        const newIds = [...prev];
        allOnPageIds.forEach((id: string) => {
          if (!newIds.includes(id)) newIds.push(id);
        });
        return newIds;
      });
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

  const handleBulkDelete = async (forceAll: boolean = false) => {
    try {
      if (forceAll || (isAllSelectedAcrossPages && isDeleteAllDialogOpen)) {
        await bulkDeleteSchemes({ 
          mode: 'all', 
          q: search, 
          deptId: deptId === 'all' ? '' : deptId,
          financialYear: settingsData?.settings?.financial_year || ''
        }).unwrap();
        toast.success('All schemes deleted successfully');
      } else {
        await bulkDeleteSchemes({ ids: selectedIds }).unwrap();
        toast.success(`${selectedIds.length} schemes deleted successfully`);
      }
      setSelectedIds([]);
      setIsAllSelectedAcrossPages(false);
      setIsBulkDeleteDialogOpen(false);
      setIsDeleteAllDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to delete schemes');
    }
  };

  const handleDeleteAllClick = () => {
    setIsDeleteAllDialogOpen(true);
  };

  const handleSingleExport = async (scheme: Scheme) => {
    try {
      const params = new URLSearchParams({
        schemeId: scheme.id
      });
      
      const response = await fetch(`/api/schemes/export?${params.toString()}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Scheme_${scheme.scheme_code}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Exported successfully');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export');
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
      toast.success('Scheme deleted successfully');
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to delete scheme');
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
              Government Schemes
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage budget allocations and expenditure for all schemes.</p>
          </div>
          {isAdmin && selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border dark:border-slate-700 shadow-sm">
              <span className="text-sm text-slate-600 dark:text-slate-300 font-bold whitespace-nowrap bg-white dark:bg-slate-700 px-2.5 py-0.5 rounded-full border dark:border-slate-600 shadow-sm">
                {isAllSelectedAcrossPages ? 'All records selected' : `${selectedIds.length} selected`}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex-1 sm:flex-none items-center h-10 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold shadow-sm"
                    disabled={isLoading || schemes.length === 0}
                  >
                    <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                    Bulk Actions
                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1">
                  <DropdownMenuItem 
                    className="text-slate-600 focus:text-slate-700 cursor-pointer font-medium"
                    onClick={handleSelectAll}
                  >
                    {isAllSelectedAcrossPages || (selectedIds.length === schemes.length && schemes.length > 0) ? <CheckSquare className="w-4 h-4 mr-2 text-emerald-500" /> : <Square className="w-4 h-4 mr-2" />}
                    {isAllSelectedAcrossPages || (selectedIds.length === schemes.length && schemes.length > 0) ? 'Deselect Page' : 'Select Page'}
                  </DropdownMenuItem>
                  {selectedIds.length > 0 && !isAllSelectedAcrossPages && pagination.total > schemes.length && (
                    <DropdownMenuItem 
                      className="text-emerald-600 focus:text-emerald-700 cursor-pointer font-bold"
                      onClick={() => setIsAllSelectedAcrossPages(true)}
                    >
                      <CheckSquare className="w-4 h-4 mr-2" />
                      Select All {pagination.total} Records
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-700 cursor-pointer font-bold"
                    disabled={selectedIds.length === 0 && !isAllSelectedAcrossPages}
                    onClick={() => setIsBulkDeleteDialogOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-700 cursor-pointer font-bold border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
                    onClick={handleDeleteAllClick}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All Filtered
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="outline"
                className="flex-1 sm:flex-none h-10 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold shadow-sm"
                onClick={() => setIsBulkImportExportOpen(true)}
              >
                <Upload className="w-4 h-4 mr-2 text-blue-500" />
                Import/Export
              </Button>
            </>
          )}
          {isAdmin && (
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center w-full sm:w-auto justify-center h-10 font-bold active:scale-[0.98] transition-all" 
              onClick={() => {
                setSelectedScheme(null);
                setIsDialogOpen(true);
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              Add Scheme
            </Button>
          )}
        </div>
      </div>

      <SchemeDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        scheme={selectedScheme}
      />

      <BulkImportExportDialog
        open={isBulkImportExportOpen}
        onOpenChange={setIsBulkImportExportOpen}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scheme</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this scheme? This action cannot be undone.
            </AlertDialogDescription>
            <div className="mt-2 p-3 bg-slate-50 rounded border text-slate-900 font-medium">
              {schemeToDelete?.scheme_code} - {schemeToDelete?.scheme_name}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? 'Saving...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Delete All Schemes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-bold text-red-600">ALL</span> schemes? 
              This action <span className="font-bold underline">cannot be undone</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                handleBulkDelete(true);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {isBulkDeleting ? 'Deleting...' : 'Yes, Delete All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Schemes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the selected schemes? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleBulkDelete(false)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="text-lg font-medium">Schemes List</CardTitle>
              {isAdmin && (selectedIds.length > 0 || isAllSelectedAcrossPages) && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                  <span className="text-sm text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {isAllSelectedAcrossPages ? pagination.total : selectedIds.length} selected
                  </span>
                </div>
              )}
            </div>
          </div>
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search schemes by name or code..."
                value={search}
                onChange={handleSearchChange}
                className="pl-9 h-10 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 font-medium"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 min-w-[300px]">
              <div className="flex-1">
                <Select value={deptId} onValueChange={(val) => { setDeptId(val); setPage(1); }}>
                  <SelectTrigger className="h-10 border-slate-200 dark:border-slate-800 font-medium">
                    <div className="flex items-center gap-2">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <SelectValue placeholder="Filter by Department" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="all" className="font-bold text-emerald-600">All Departments</SelectItem>
                    {departments.map((dept: any) => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
        </CardHeader>
        <CardContent>
          {/* Selection Banner */}
          {isAdmin && !isLoading && selectedIds.length === schemes.length && schemes.length > 0 && pagination.total > schemes.length && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-100 rounded-md flex items-center justify-center gap-2 text-sm text-blue-700 animate-in fade-in slide-in-from-top-1">
              {isAllSelectedAcrossPages ? (
                <>
                  <span>All {pagination.total} schemes selected across all pages.</span>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-blue-800 font-bold" 
                    onClick={() => { setIsAllSelectedAcrossPages(false); setSelectedIds([]); }}
                  >
                    Clear selection
                  </Button>
                </>
              ) : (
                <>
                  <span>All {schemes.length} schemes on this page are selected.</span>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-blue-800 font-bold" 
                    onClick={() => setIsAllSelectedAcrossPages(true)}
                  >
                    Select all {pagination.total} schemes across all pages
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Desktop Table View - Hidden on Mobile */}
          <div className="hidden lg:block rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto overflow-y-visible">
              <Table className="min-w-[1600px]">
                <TableHeader>
                  <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-b dark:border-slate-800">
                    {isAdmin && (
                      <TableHead className="w-[50px] px-4 text-center">
                        <Checkbox 
                          checked={isAllSelectedAcrossPages || (schemes.length > 0 && schemes.every((s: Scheme) => selectedIds.includes(s.id)))}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all"
                          className="translate-y-[2px] border-slate-300 dark:border-slate-600"
                        />
                      </TableHead>
                    )}
                    <TableHead className="w-[60px] font-semibold text-slate-700 dark:text-slate-300">S.No</TableHead>
                    <TableHead className="w-[120px] font-semibold text-slate-700 dark:text-slate-300">Scheme Code</TableHead>
                    <TableHead className="min-w-[300px] font-semibold text-slate-700 dark:text-slate-300">Scheme Name</TableHead>
                    <TableHead className="min-w-[180px] font-semibold text-slate-700 dark:text-slate-300">Department</TableHead>
                    <TableHead className="min-w-[150px] font-semibold text-slate-700 dark:text-slate-300">Category</TableHead>
                    <TableHead className="min-w-[150px] font-semibold text-slate-700 dark:text-slate-300">Sub-Category</TableHead>
                    <TableHead className="min-w-[150px] font-semibold text-slate-700 dark:text-slate-300">Sub-Category 2</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">Total Budget</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">Allotment</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">Expenditure</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">% Budget</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">% Actual</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">Prov. Exp</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300 sticky right-0 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm px-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading || isFetching ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i} className="border-b dark:border-slate-800">
                        {isAdmin && <TableCell className="px-4"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>}
                        <TableCell className="px-4"><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                        {Array(10).fill(0).map((_, j) => (
                          <TableCell key={j} className={j === 9 ? "sticky right-0 bg-white dark:bg-slate-900 px-4" : ""}><Skeleton className="h-4 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : schemes.length > 0 ? (
                    schemes.map((scheme: Scheme, index: number) => (
                      <TableRow 
                        key={scheme.id} 
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b dark:border-slate-800 ${(isAllSelectedAcrossPages || selectedIds.includes(scheme.id)) ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}
                      >
                        {isAdmin && (
                          <TableCell className="px-4 text-center">
                            <Checkbox 
                              checked={isAllSelectedAcrossPages || selectedIds.includes(scheme.id)}
                              onCheckedChange={() => handleSelectOne(scheme.id)}
                              aria-label={`Select ${scheme.scheme_name}`}
                              className="translate-y-[2px] border-slate-300 dark:border-slate-600"
                            />
                          </TableCell>
                        )}
                        <TableCell className="font-medium text-slate-500">{(page - 1) * limit + index + 1}</TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{scheme.scheme_code}</TableCell>
                        <TableCell className="min-w-[300px] max-w-[400px]">
                          <div className="font-medium text-slate-900 dark:text-white leading-tight line-clamp-2 break-words" title={scheme.scheme_name}>
                            {scheme.scheme_name}
                          </div>
                        </TableCell>
                      <TableCell className="min-w-[180px]">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block break-words">
                          {scheme.department.name}
                        </span>
                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block break-words">
                          {scheme.mappings?.[0]?.category?.name || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block break-words">
                          {scheme.mappings?.[0]?.part?.part_name || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block break-words">
                          {scheme.mappings?.[1]?.part?.part_name || '-'}
                        </span>
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
                            className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20" 
                            title="Export Excel"
                            onClick={() => handleSingleExport(scheme)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          {isAdmin && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20" 
                                title="Edit"
                                onClick={() => handleEdit(scheme)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" 
                                title="Delete"
                                onClick={() => handleDeleteClick(scheme)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 15 : 14} className="text-center py-10 text-slate-500">
                      No schemes found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Card View - Hidden on Desktop */}
          <div className="lg:hidden space-y-4 bg-slate-50/50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            {isLoading || isFetching ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : schemes.length > 0 ? (
              schemes.map((scheme: Scheme) => (
                <Card 
                  key={scheme.id} 
                  className={`overflow-hidden transition-all duration-200 border-slate-200 dark:border-slate-800 active:scale-[0.99] ${
                    (isAllSelectedAcrossPages || selectedIds.includes(scheme.id)) 
                      ? 'ring-2 ring-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10' 
                      : 'hover:border-emerald-200 dark:hover:border-emerald-800 shadow-sm bg-white dark:bg-slate-900'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                            {scheme.scheme_code}
                          </Badge>
                          <span className="text-[10px] font-bold text-slate-400 truncate">
                            {scheme.department.name}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white leading-snug text-base mb-3 line-clamp-2">
                          {scheme.scheme_name}
                        </h3>
                      </div>
                      {isAdmin && (
                        <Checkbox 
                          checked={isAllSelectedAcrossPages || selectedIds.includes(scheme.id)}
                          onCheckedChange={() => handleSelectOne(scheme.id)}
                          className="mt-1 border-slate-300 dark:border-slate-600"
                        />
                      )}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                            {scheme.mappings?.[0]?.category.name || '---'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sub-Category</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                            {scheme.mappings?.[0]?.part?.part_name || '---'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Budget</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {formatCurrency(scheme.total_budget_provision)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expenditure</p>
                          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-500">
                            {formatCurrency(scheme.actual_progressive_expenditure)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                          <span className="text-slate-500">Utilization</span>
                          <span className={(Number(scheme.pct_actual_expenditure) || 0) > 90 ? 'text-red-500' : 'text-emerald-600'}>
                            {(Number(scheme.pct_actual_expenditure) || 0).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                          <div 
                            className={`h-full transition-all duration-500 rounded-full ${
                              (Number(scheme.pct_actual_expenditure) || 0) > 90 ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(Number(scheme.pct_actual_expenditure) || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 h-9 text-xs font-bold gap-2 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/20"
                        onClick={() => handleSingleExport(scheme)}
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export
                      </Button>
                      {isAdmin && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 h-9 text-xs font-bold gap-2 border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20"
                            onClick={() => handleEdit(scheme)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 border-slate-200 dark:border-slate-700"
                            onClick={() => handleDeleteClick(scheme)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <FileText className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-bold">No schemes found.</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left font-medium">
              Showing <span className="font-bold text-slate-900 dark:text-white">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-bold text-slate-900 dark:text-white">
                {Math.min(page * limit, pagination.total)}
              </span>{' '}
              of <span className="font-bold text-slate-900 dark:text-white">{pagination.total}</span> schemes
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
                Previous
              </Button>
              <div className="text-sm font-medium min-w-[100px] text-center">
                Page {page} of {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages || isLoading}
                className="flex-1 sm:flex-none h-8 px-3"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

