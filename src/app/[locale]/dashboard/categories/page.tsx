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
import { Tags, Plus, Check, X, Layers, Pencil, Trash2, Image as ImageIcon, CheckSquare, Square } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useGetCategoriesQuery, 
  useDeleteCategoryMutation,
  useBulkDeleteCategoriesMutation
} from '@/store/services/api';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { CategoryDialog } from '@/components/categories/CategoryDialog';
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
  icon?: string;
  image?: string;
  parts: CategoryPart[];
}

export default function CategoriesPage() {
  const t = useTranslations('Categories');
  const tDept = useTranslations('Departments');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  const { data: categories, isLoading } = useGetCategoriesQuery();
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
      await bulkDeleteCategories({ ids: selectedIds }).unwrap();
      toast.success(t('deleteSuccess') || 'Categories deleted successfully');
      setSelectedIds([]);
      setIsBulkDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.error || t('errorDeletingCategory') || 'Failed to delete categories');
    }
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
      toast.success(t('deleteSuccess') || 'Category deleted successfully');
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.error || t('errorDeletingCategory') || 'Failed to delete category');
    }
  };

  const handleAddClick = () => {
    setSelectedCategory(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <Tags className="w-6 h-6 text-indigo-600" />
              {t('title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
          </div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                {selectedIds.length} {tDept('selected')}
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
        <div className="flex items-center gap-2">
          {categories && categories.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSelectAll}
              className="flex-1 sm:flex-none h-9"
            >
              {selectedIds.length === categories.length ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
              {tDept('selectAll')}
            </Button>
          )}
          <Button 
            onClick={handleAddClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all duration-200 flex items-center flex-1 sm:flex-none justify-center h-9"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('addCategory')}
          </Button>
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
            <AlertDialogTitle>{t('deleteCategory') || 'Delete Category'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteCategory') || 'Are you sure you want to delete this category? This action cannot be undone.'}
            </AlertDialogDescription>
            <div className="mt-2 p-3 bg-slate-50 rounded border text-slate-900 font-medium">
              {categoryToDelete?.name}
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
            <AlertDialogTitle>{t('deleteCategory') || 'Delete Category'}</AlertDialogTitle>
            <AlertDialogDescription>
              {tDept('confirmBulkDelete', { count: selectedIds.length })}
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
              <CardContent><Skeleton className="h-20 w-full" /></CardContent>
            </Card>
          ))
        ) : categories?.length > 0 ? (
          categories.map((category: Category) => (
            <Card 
              key={category.id} 
              className={`group overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col ${selectedIds.includes(category.id) ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/30' : ''}`}
            >
              <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-800 pb-4 relative">
                {/* Checkbox Overlay */}
                <div className={`absolute top-2 left-2 z-10 transition-opacity duration-200 ${selectedIds.includes(category.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <Checkbox 
                    checked={selectedIds.includes(category.id)}
                    onCheckedChange={() => handleSelectOne(category.id)}
                    className="bg-white border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 shadow-sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 ml-6">
                    {category.image ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden border bg-white flex-shrink-0">
                        <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700">
                        <Tags className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <CardTitle className="text-lg leading-tight">{category.name}</CardTitle>
                  </div>
                  <Badge variant={category.has_parts ? "default" : "secondary"}>
                    {category.has_parts ? t('hasParts') : t('simple')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('configuration')}</span>
                    <div className="flex items-center mt-2 text-sm">
                      {category.has_parts ? (
                        <div className="flex items-center text-green-600">
                          <Check className="w-4 h-4 mr-2" />
                          {t('multiPartEnabled')}
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-500">
                          <Check className="w-4 h-4 mr-2" />
                          {t('directMapping')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {category.has_parts && (
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('definedParts')}</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {category.parts.map((part) => (
                          <Badge key={part.id} variant="outline" className="bg-slate-50 dark:bg-slate-800/50">
                            {t('part')} {part.part_name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEdit(category)}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    {t('edit')}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-1"
                    onClick={() => handleDeleteClick(category)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed dark:border-slate-800">
            <Layers className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('noCategories')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('startAdding')}</p>
            <Button className="mt-4" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              {t('addFirst')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
