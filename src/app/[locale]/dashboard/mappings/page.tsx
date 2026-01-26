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
import { Plus, Trash2, Search, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useGetSchemesQuery, 
  useGetCategoriesQuery, 
  useGetMappingsQuery,
  useAddMappingMutation,
  useDeleteMappingMutation 
} from '@/store/services/api';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';

export default function MappingPage() {
  const t = useTranslations('Mappings');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [schemeSearch, setSchemeSearch] = useState('');

  const { data: schemesData, isLoading: isLoadingSchemes } = useGetSchemesQuery({ q: schemeSearch, limit: 10 });
  const { data: categories } = useGetCategoriesQuery();
  const { data: mappings, isLoading: isLoadingMappings } = useGetMappingsQuery(
    { schemeId: selectedSchemeId }, 
    { skip: !selectedSchemeId }
  );

  const [addMapping, { isLoading: isAdding }] = useAddMappingMutation();
  const [deleteMapping] = useDeleteMappingMutation();

  const schemes = schemesData?.schemes || [];
  const selectedCategory = categories?.find((c: any) => c.id === selectedCategoryId);

  const handleAddMapping = async () => {
    if (!selectedSchemeId || !selectedCategoryId) return;
    
    try {
      await addMapping({
        scheme_id: selectedSchemeId,
        category_id: selectedCategoryId,
        part_id: selectedPartId || null,
      }).unwrap();
      
      setSelectedCategoryId('');
      setSelectedPartId('');
    } catch (err) {
      console.error('Failed to add mapping:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Step 1: Select Scheme */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center mr-2">1</span>
              {t('selectScheme')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t('searchScheme')}
                value={schemeSearch}
                onChange={(e) => setSchemeSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="space-y-2 max-h-100 overflow-y-auto pr-2">
              {isLoadingSchemes ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
              ) : schemes.map((scheme: any) => (
                <button
                  key={scheme.id}
                  onClick={() => setSelectedSchemeId(scheme.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedSchemeId === scheme.id 
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary' 
                      : 'hover:border-gray-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="text-xs font-mono text-primary mb-1">{scheme.scheme_code}</div>
                  <div className="text-sm font-semibold truncate dark:text-gray-200">{scheme.scheme_name}</div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 truncate">{scheme.department.name}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Add Mappings & View Existing */}
        <div className="lg:col-span-2 space-y-6">
          {selectedSchemeId ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center mr-2">2</span>
                    {t('addNewMapping')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-medium text-gray-500">{t('budgetCategory')}</label>
                      <Select value={selectedCategoryId} onValueChange={(val) => { setSelectedCategoryId(val); setSelectedPartId(''); }}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectCategory')} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedCategory?.has_parts && (
                      <div className="flex-1 space-y-2">
                        <label className="text-xs font-medium text-gray-500">{t('categoryPart')}</label>
                        <Select value={selectedPartId} onValueChange={setSelectedPartId}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectPart')} />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedCategory.parts.map((part: any) => (
                              <SelectItem key={part.id} value={part.id}>{t('partLabel', { name: part.part_name })}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <Button 
                      onClick={handleAddMapping} 
                      disabled={!selectedCategoryId || (selectedCategory?.has_parts && !selectedPartId) || isAdding}
                      className="w-full md:w-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('addMapping')}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">{t('existingMappings')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Desktop Table View */}
                  <div className="hidden md:block rounded-md border">
                    <Table>
                      <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900">
                          <TableHead>{t('category')}</TableHead>
                          <TableHead>{t('part')}</TableHead>
                          <TableHead className="text-right">{t('actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingMappings ? (
                          <TableRow><TableCell colSpan={3}><Skeleton className="h-20 w-full" /></TableCell></TableRow>
                        ) : mappings?.length > 0 ? (
                          mappings.map((mapping: any) => (
                            <TableRow key={mapping.id}>
                              <TableCell className="font-medium">{mapping.category.name}</TableCell>
                              <TableCell>
                                {mapping.part ? (
                                  <Badge variant="outline">{t('partLabel', { name: mapping.part.part_name })}</Badge>
                                ) : (
                                  <span className="text-gray-400 text-xs">N/A</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-600"
                                  onClick={() => deleteMapping(mapping.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                              {t('noMappings')}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {isLoadingMappings ? (
                      Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
                    ) : mappings?.length > 0 ? (
                      mappings.map((mapping: any) => (
                        <div key={mapping.id} className="p-3 border rounded-lg flex justify-between items-center bg-white dark:bg-slate-900 shadow-sm">
                          <div>
                            <div className="font-semibold text-sm dark:text-slate-200">{mapping.category.name}</div>
                            {mapping.part && (
                              <div className="mt-1">
                                <Badge variant="outline" className="text-[10px] h-5">{t('partLabel', { name: mapping.part.part_name })}</Badge>
                              </div>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 h-8 w-8 p-0"
                            onClick={() => deleteMapping(mapping.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-400 text-sm bg-slate-50 rounded-lg border-2 border-dashed">
                        {t('noMappings')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50 rounded-xl border-2 border-dashed">
              <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                <Info className="w-8 h-8 text-primary/40" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">{t('noSchemeSelected')}</h3>
              <p className="text-gray-500 text-center max-w-xs mt-2">
                {t('selectSchemePrompt')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
