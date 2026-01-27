'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Building2, FileText, Tag, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useGetSchemesQuery } from '@/store/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface CategoryDetailModalProps {
  category: any;
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryDetailModal({ category, isOpen, onClose }: CategoryDetailModalProps) {
  const t = useTranslations('Mappings');
  const tCommon = useTranslations('Departments');
  const tAudit = useTranslations('AuditLogs');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const itemsPerPage = 10;
  
  const { data: schemesData, isLoading } = useGetSchemesQuery({
    categoryId: category?.id,
    q: searchQuery,
    page: currentPage,
    limit: itemsPerPage
  }, { skip: !category?.id || !isOpen });

  const schemes = schemesData?.schemes || [];
  const totalPages = schemesData?.pagination?.totalPages || 1;
  const totalItems = schemesData?.pagination?.total || 0;

  // Reset page when search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleExport = async () => {
    if (!category?.id) return;
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        categoryId: category.id,
        q: searchQuery
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
      toast.success(tCommon('exportSuccess') || 'Exported successfully');
    } catch (err) {
      console.error('Export error:', err);
      toast.error(tCommon('exportError') || 'Failed to export');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSingleExport = async (scheme: any) => {
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
      toast.success(tCommon('exportSuccess') || 'Exported successfully');
    } catch (err) {
      console.error('Export error:', err);
      toast.error(tCommon('exportError') || 'Failed to export');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Tag className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">{category?.name}</DialogTitle>
          </div>
          <DialogDescription>
            {t('categoryDetails')}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-2 space-y-4 flex-1 overflow-hidden flex flex-col">
          {category?.has_parts && category.parts && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium text-slate-500 mr-1 self-center">{t('subCategory')}:</span>
              {category.parts.map((part: any) => (
                <Badge key={part.id} variant="secondary" className="bg-slate-100 dark:bg-slate-800">
                  {part.part_name}
                </Badge>
              ))}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={t('searchInCategory')}
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              {t('schemesInCategory')}
              <Badge variant="outline" className="ml-auto">{totalItems}</Badge>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 ml-2" 
                onClick={handleExport}
                disabled={isExporting || totalItems === 0}
              >
                <Download className="w-3 h-3 mr-1" />
                {tAudit('exportExcel')}
              </Button>
            </h4>
            
            <ScrollArea className="flex-1 border rounded-lg bg-slate-50/30 dark:bg-slate-900/30">
              <div className="p-4 space-y-3">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="space-y-2 p-3 bg-white dark:bg-slate-900 rounded-md border">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))
                ) : schemes.length > 0 ? (
                  schemes.map((scheme: any) => (
                    <div 
                      key={scheme.id} 
                      className="p-3 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-primary/30"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-mono font-medium text-primary bg-primary/5 px-1.5 py-0.5 rounded">
                          {scheme.scheme_code}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                          onClick={() => handleSingleExport(scheme)}
                          title={tCommon('exportExcel')}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 leading-snug">
                        {scheme.scheme_name}
                      </h5>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <Building2 className="w-3 h-3" />
                        <span className="truncate">{scheme.department.name}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-sm text-slate-500">{t('noSchemesFound')}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-xs text-slate-500">
                {tAudit('pageOf', { current: currentPage, total: totalPages })}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-slate-400 border-slate-300 dark:border-slate-700">
            {t('systemName')}
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  );
}
