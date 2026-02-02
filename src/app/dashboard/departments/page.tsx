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
import { Search, Building2, Download, ChevronLeft, ChevronRight, Eye, Pencil, Trash2, CheckSquare, Square, ChevronDown } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from '@/components/ui/skeleton';
import { exportToExcel } from '@/lib/export';
import { Badge } from '@/components/ui/badge';
import { 
  useGetDepartmentsQuery, 
  useDeleteDepartmentMutation,
  useBulkDeleteDepartmentsMutation 
} from '@/store/services/api';
import { useGetMeQuery } from '@/store/services/api';
import Link from 'next/link';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Department {
  id: string;
  name: string;
  nameHn: string;
  _count?: {
    schemes: number;
  };
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
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const limit = 25;

  const { data: userData } = useGetMeQuery();
  const isAdmin = userData?.user?.role === 'ADMIN';

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
      return;
    }

    const allOnPageIds = departments.map((d: Department) => d.id);
    const areAllOnPageSelected = allOnPageIds.every((id: string) => selectedIds.includes(id));

    if (areAllOnPageSelected) {
      // Unselect all on current page
      setSelectedIds(prev => prev.filter(id => !allOnPageIds.includes(id)));
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

  const handleBulkDelete = async (forceAll: boolean = false) => {
    try {
      if (forceAll || (isAllSelectedAcrossPages && isDeleteAllDialogOpen)) {
        await bulkDeleteDepartments({ mode: 'all', q: search }).unwrap();
        toast.success("All departments deleted successfully");
      } else {
        await bulkDeleteDepartments({ ids: selectedIds }).unwrap();
        toast.success(`${selectedIds.length} departments deleted successfully`);
      }
      setSelectedIds([]);
      setIsAllSelectedAcrossPages(false);
      setIsBulkDeleteDialogOpen(false);
      setIsDeleteAllDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.error || "Failed to delete departments");
    }
  };

  const handleDeleteAllClick = () => {
    setIsDeleteAllDialogOpen(true);
  };

  const handleExport = () => {
    const exportData = departments.map((d: Department, i: number) => ({
      "S.No": (page - 1) * limit + i + 1,
      "Department Name": d.name,
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
      toast.success("Department deleted successfully");
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.error || "Failed to delete department");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Departments</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage administrative departments and their details.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex-1 sm:flex-none items-center h-10" onClick={handleExport} disabled={isLoading || departments.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {isAdmin && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex-1 sm:flex-none items-center h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-900/20"
                    disabled={isLoading || departments.length === 0}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Bulk Actions
                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      className="text-slate-600 focus:text-slate-700 cursor-pointer"
                      onClick={handleSelectAll}
                    >
                      {selectedIds.length === departments.length ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                      {selectedIds.length === departments.length ? 'Deselect Page' : 'Select Page'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-700 cursor-pointer"
                      disabled={selectedIds.length === 0 && !isAllSelectedAcrossPages}
                      onClick={() => setIsBulkDeleteDialogOpen(true)}
                    >
                      <CheckSquare className="w-4 h-4 mr-2" />
                      Delete Selected
                    </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-700 cursor-pointer font-medium"
                    disabled={departments.length === 0}
                    onClick={handleDeleteAllClick}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button className="flex-1 sm:flex-none items-center h-10" onClick={() => { setSelectedDept(null); setIsDialogOpen(true); }}>
                <Building2 className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            </>
          )}
        </div>
      </div>

      <DepartmentDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        department={selectedDept}
      />

      <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Delete All Departments</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-bold text-red-600">ALL</span> departments? 
              This will also delete all schemes and mappings associated with these departments.
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this department? This action cannot be undone.
            </AlertDialogDescription>
            <div className="mt-2 p-3 bg-slate-50 rounded border text-slate-900 font-medium">
              {deptToDelete?.name}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? "Saving..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Departments</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the selected departments? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleBulkDelete(false)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <CardTitle className="text-lg font-medium">Department List</CardTitle>
              {isAdmin && (selectedIds.length > 0 || isAllSelectedAcrossPages) && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                  <span className="text-sm text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {isAllSelectedAcrossPages ? pagination.total : selectedIds.length} selected
                  </span>
                </div>
              )}
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search departments..."
                value={search}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Selection Banner */}
          {isAdmin && !isLoading && selectedIds.length === departments.length && departments.length > 0 && pagination.total > departments.length && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-100 rounded-md flex items-center justify-center gap-2 text-sm text-blue-700 animate-in fade-in slide-in-from-top-1">
              {isAllSelectedAcrossPages ? (
                <>
                  <span>All {pagination.total} departments selected.</span>
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
                  <span>Selected {departments.length} departments on this page.</span>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-blue-800 font-bold" 
                    onClick={() => setIsAllSelectedAcrossPages(true)}
                  >
                    Select all {pagination.total} departments
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-b dark:border-slate-800">
                  <TableHead className="w-[50px] px-4 text-center">
                    <Checkbox 
                      checked={isAllSelectedAcrossPages || (departments.length > 0 && departments.every((d: Department) => selectedIds.includes(d.id)))}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select All"
                      className="translate-y-[2px] border-slate-300 dark:border-slate-600"
                    />
                  </TableHead>
                  <TableHead className="w-[80px] font-semibold text-slate-700 dark:text-slate-300">S.No</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Department Name</TableHead>
                  <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">Schemes</TableHead>
                  <TableHead className="text-right w-[150px] font-semibold text-slate-700 dark:text-slate-300 px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || isFetching ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="border-b dark:border-slate-800">
                      <TableCell className="px-4"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                      <TableCell className="text-right px-6"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : departments.length > 0 ? (
                  departments.map((dept: Department, index: number) => (
                    <TableRow 
                      key={dept.id} 
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b dark:border-slate-800 ${(isAllSelectedAcrossPages || selectedIds.includes(dept.id)) ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}
                    >
                      <TableCell className="px-4 text-center">
                        <Checkbox 
                          checked={isAllSelectedAcrossPages || selectedIds.includes(dept.id)}
                          onCheckedChange={() => handleSelectOne(dept.id)}
                          aria-label={`Select ${dept.name}`}
                          className="translate-y-[2px] border-slate-300 dark:border-slate-600"
                        />
                      </TableCell>
                      <TableCell className="font-medium text-slate-500">{(page - 1) * limit + index + 1}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-slate-900 dark:text-white leading-tight">{dept.name}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={dept._count?.schemes ? "secondary" : "outline"} 
                          className={dept._count?.schemes ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800 font-bold" : "text-slate-400 border-slate-200 dark:border-slate-800"}
                        >
                          {dept._count?.schemes || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex justify-end gap-1">
                          <Link href={`/dashboard/departments/${dept.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20" title="View Details">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          {isAdmin && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20" 
                                title="Edit"
                                onClick={() => handleEdit(dept)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20" 
                                title="Delete"
                                onClick={() => handleDeleteClick(dept)}
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
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <Building2 className="w-10 h-10 mb-2 opacity-20" />
                        <p>No departments found.</p>
                      </div>
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
                <Card key={i} className="overflow-hidden border-slate-200 dark:border-slate-800">
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-6 w-3/4" />
                    <div className="pt-2 flex justify-end">
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : departments.length > 0 ? (
              departments.map((dept: Department) => (
                <Card 
                  key={dept.id} 
                  className={`overflow-hidden transition-all duration-200 border-slate-200 dark:border-slate-800 active:scale-[0.98] ${
                    (isAllSelectedAcrossPages || selectedIds.includes(dept.id)) 
                      ? 'ring-2 ring-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10' 
                      : 'hover:border-emerald-200 dark:hover:border-emerald-800 shadow-sm'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0 border-slate-200 dark:border-slate-800">
                            Dept
                          </Badge>
                          <span className="text-[10px] font-bold text-slate-400">
                            {dept._count?.schemes || 0} Schemes
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white leading-tight">
                          {dept.name}
                        </h3>
                      </div>
                      {isAdmin && (
                        <Checkbox 
                          checked={isAllSelectedAcrossPages || selectedIds.includes(dept.id)}
                          onCheckedChange={() => handleSelectOne(dept.id)}
                          className="mt-1 border-slate-300 dark:border-slate-600"
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t dark:border-slate-800">
                      <Link href={`/dashboard/departments/${dept.id}`} className="flex-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full h-9 text-xs font-semibold gap-2 border-slate-200 dark:border-slate-700"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Button>
                      </Link>
                      {isAdmin && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 h-9 text-xs font-semibold gap-2 border-slate-200 dark:border-slate-700"
                            onClick={() => handleEdit(dept)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 border-slate-200 dark:border-slate-700"
                            onClick={() => handleDeleteClick(dept)}
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
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No departments found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm">
                  We couldn't find any departments matching your search.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 border-t gap-4">
            <div className="text-sm text-slate-500 text-center sm:text-left">
            Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(page * limit, pagination.total)}
            </span>{' '}
            of <span className="font-medium">{pagination.total}</span> departments
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
              Previous
            </Button>
            <div className="text-sm font-medium min-w-[100px] text-center">
              Page {page} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages || isLoading || isFetching}
              className="flex-1 sm:flex-none"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

