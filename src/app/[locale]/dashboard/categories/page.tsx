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
import { Tags, Plus, Check, X, Layers } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetCategoriesQuery } from '@/store/services/api';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { CategoryDialog } from '@/components/categories/CategoryDialog';

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
  const t = useTranslations('Categories');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: categories, isLoading } = useGetCategoriesQuery();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('title')}</h1>
          <p className="text-gray-500">{t('subtitle')}</p>
        </div>
        <Button className="flex items-center w-full sm:w-auto justify-center" onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('addCategory')}
        </Button>
      </div>

      <CategoryDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

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
            <Card key={category.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="bg-slate-50 border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-white rounded-lg border">
                      <Tags className="w-4 h-4 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  <Badge variant={category.has_parts ? "default" : "secondary"}>
                    {category.has_parts ? t('hasParts') : t('simple')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
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
                          <Badge key={part.id} variant="outline" className="bg-slate-50">
                            {t('part')} {part.part_name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">{t('edit')}</Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1">{t('delete')}</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border-2 border-dashed">
            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">{t('noCategories')}</h3>
            <p className="text-gray-500 mt-1">{t('startAdding')}</p>
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
