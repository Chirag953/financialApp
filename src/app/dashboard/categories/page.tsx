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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tags, Plus, Check, X, Layers, Pencil, Trash2, Image as ImageIcon, CheckSquare, Square, FileText, Download, ChevronDown } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useGetCategoriesQuery, 
  useGetMeQuery,
  useDeleteCategoryMutation,
  useBulkDeleteCategoriesMutation
} from '@/store/services/api';
import { Badge } from '@/components/ui/badge';
import { CategoryDialog } from '@/components/categories/CategoryDialog';
import { CategoryDetailModal } from '@/components/categories/CategoryDetailModal';
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
import { toast } from 'sonner';

interface CategoryPart {
  id: string;
  part_name: string;
}

interface Category {
  id: string;
  name: string;
  has_parts: boolean;
  parts: CategoryPart[];
}

export default function CategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [viewingCategoryForSchemes, setViewingCategoryForSchemes] = useState<Category | null>(null);
  const [exportingCategoryId, setExportingCategoryId] = useState<string | null>(null);

  const { data: categories, isLoading } = useGetCategoriesQuery({});
  const { data: userData } = useGetMeQuery();
  const isAdmin = userData?.user?.role === 'ADMIN';

  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [bulkDeleteCategories, { isLoading: isBulkDeleting }] = useBulkDeleteCategoriesMutation();

  const handleSelectAll = () => {
    if (selectedIds.length === categories?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(categories?.map((c: Category) => c.id) || []);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter((i: string) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    try {
      if (isDeleteAllDialogOpen) {
        await bulkDeleteCategories({ mode: 'all' }).unwrap();
        toast.success('All categories deleted successfully');
      } else {
        await bulkDeleteCategories({ ids: selectedIds }).unwrap();
        toast.success(`${selectedIds.length} categories deleted successfully`);
      }
      setSelectedIds([]);
      setIsBulkDeleteDialogOpen(false);
      setIsDeleteAllDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to delete categories');
    }
  };

  const handleDeleteAllClick = () => {
    setIsDeleteAllDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete.id).unwrap();
      toast.success('Category deleted successfully');
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to delete category');
    }
  };

  const handleAddClick = () => {
    setSelectedCategory(null);
    setIsDialogOpen(true);
  };

  const handleExport = async (category: Category) => {
    if (!category?.id) return;
    setExportingCategoryId(category.id);
    try {
      const params = new URLSearchParams({
        categoryId: category.id
      });
      
      const response = await fetch(`/api/schemes/export?${params.toString()}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${category.name}_Schemes_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Exported successfully');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export');
    } finally {
      setExportingCategoryId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Tags className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
              Budget Categories
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage expense categories and their sub-parts</p>
          </div>
          {isAdmin && selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full border dark:border-slate-600 shadow-sm">
                {selectedIds.length} selected
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && categories && categories.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex-1 sm:flex-none items-center h-9 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-900/20"
                  disabled={isBulkDeleting}
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
                  {selectedIds.length === categories.length ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                  {selectedIds.length === categories.length ? 'Deselect All' : 'Select All'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-700 cursor-pointer"
                  disabled={selectedIds.length === 0}
                  onClick={() => setIsBulkDeleteDialogOpen(true)}
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-700 cursor-pointer font-medium"
                  onClick={handleDeleteAllClick}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {isAdmin && (
            <Button 
              onClick={handleAddClick}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all duration-200 flex items-center flex-1 sm:flex-none justify-center h-9"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          )}
        </div>
      </div>

      <CategoryDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        category={selectedCategory}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </AlertDialogDescription>
            <div className="mt-2 p-3 bg-slate-50 rounded border text-slate-900 font-medium">
              {categoryToDelete?.name}
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

      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Categories</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the selected categories? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Categories</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all categories? This action cannot be undone and will remove all associated budget data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="border-slate-200 dark:border-slate-800">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50"><Skeleton className="h-6 w-32" /></CardHeader>
              <CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent>
            </Card>
          ))
        ) : categories?.length > 0 ? (
          categories.map((category: Category) => (
            <Card 
              key={category.id} 
              className={`group overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col border-slate-200 dark:border-slate-800 ${selectedIds.includes(category.id) ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10' : 'hover:border-slate-300 dark:hover:border-slate-700'}`}
            >
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b dark:border-slate-800 pb-4 relative">
                {/* Checkbox Overlay */}
                {isAdmin && (
                  <div className={`absolute top-3 left-3 z-10 transition-opacity duration-200 ${selectedIds.includes(category.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <Checkbox 
                      checked={selectedIds.includes(category.id)}
                      onCheckedChange={() => handleSelectOne(category.id)}
                      className="bg-white border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 shadow-sm"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className={`flex items-center space-x-3 ${isAdmin ? 'ml-8' : ''}`}>
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                      <Tags className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">{category.name}</CardTitle>
                  </div>
                  <Badge 
                    variant={category.has_parts ? "default" : "secondary"}
                    className={category.has_parts ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}
                  >
                    {category.has_parts ? "Multi-Part" : "Simple"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configuration</span>
                    <div className="flex items-center mt-2 text-sm">
                      {category.has_parts ? (
                        <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                          <Check className="w-4 h-4 mr-2" />
                          Multi-part enabled
                        </div>
                      ) : (
                        <div className="flex items-center text-slate-500 dark:text-slate-400">
                          <Check className="w-4 h-4 mr-2" />
                          Direct mapping
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {category.has_parts && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Defined Parts</span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {category.parts.map((part) => (
                          <Badge key={part.id} variant="outline" className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                            Part {part.part_name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 flex flex-col gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-100/50 dark:border-emerald-800/50 font-medium"
                    onClick={() => setViewingCategoryForSchemes(category)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Schemes
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    onClick={() => handleExport(category)}
                    disabled={exportingCategoryId === category.id}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {exportingCategoryId === category.id ? 'Exporting...' : 'Download Excel'}
                  </Button>
                  {isAdmin && (
                    <div className="flex gap-2 mt-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={() => handleEdit(category)}
                      >
                        <Pencil className="w-3.5 h-3.5 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-1"
                        onClick={() => handleDeleteClick(category)}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
              <Layers className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">No categories found</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">Start by adding your first budget category to organize your financial data.</p>
            {isAdmin && (
              <Button className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleAddClick}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Category
              </Button>
            )}
          </div>
        )}
      </div>
      <CategoryDetailModal 
        category={viewingCategoryForSchemes} 
        isOpen={!!viewingCategoryForSchemes} 
        onClose={() => setViewingCategoryForSchemes(null)} 
      />
    </div>
  );
}

