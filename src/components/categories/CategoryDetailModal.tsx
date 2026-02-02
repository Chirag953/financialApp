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
      toast.success('Exported successfully');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export');
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
      toast.success('Exported successfully');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-slate-200 dark:border-slate-800 shadow-xl">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-500/20">
              <Tag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">{category?.name}</DialogTitle>
          </div>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Detailed information about this category and its mapped schemes.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-2 space-y-4 flex-1 overflow-hidden flex flex-col">
          {category?.has_parts && category.parts && (
            <div className="flex flex-wrap gap-2 items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Sub-categories:</span>
              {category.parts.map((part: any) => (
                <Badge key={part.id} variant="secondary" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                  {part.part_name}
                </Badge>
              ))}
            </div>
          )}

          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              placeholder="Search in category..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all rounded-xl"
            />
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                Schemes in Category
                <Badge variant="outline" className="ml-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">{totalItems}</Badge>
              </h4>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 transition-all" 
                onClick={handleExport}
                disabled={isExporting || totalItems === 0}
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export Excel
              </Button>
            </div>
            
            <ScrollArea className="flex-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
              <div className="p-4 space-y-3">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="space-y-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                      <Skeleton className="h-4 w-1/4 rounded-full" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-1/2 rounded-full" />
                    </div>
                  ))
                ) : schemes.length > 0 ? (
                  schemes.map((scheme: any) => (
                    <div 
                      key={scheme.id} 
                      className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-md group relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/0 group-hover:bg-emerald-500 transition-all" />
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                          {scheme.scheme_code}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
                          onClick={() => handleSingleExport(scheme)}
                          title="Export Excel"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 leading-snug">
                        {scheme.scheme_name}
                      </h5>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{scheme.department.name}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-400">No schemes found in this category.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-500">
                Page <span className="text-slate-900 dark:text-white font-bold">{currentPage}</span> of <span className="text-slate-900 dark:text-white font-bold">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-0.5">
            Scheme Mapping System
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  );
}

