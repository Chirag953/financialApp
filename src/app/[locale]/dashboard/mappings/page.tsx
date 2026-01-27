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
  useGetDepartmentsQuery,
  useGetMappingsQuery,
  useAddMappingMutation,
  useDeleteMappingMutation,
  useGetMeQuery 
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
import { CategoryDetailModal } from '@/components/categories/CategoryDetailModal';

export default function MappingPage() {
  const t = useTranslations('Mappings');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [schemeSearch, setSchemeSearch] = useState('');
  const [filterDeptId, setFilterDeptId] = useState<string>('all');
  const [viewingCategory, setViewingCategory] = useState<any>(null);

  const { data: schemesData, isLoading: isLoadingSchemes } = useGetSchemesQuery({ 
    q: schemeSearch, 
    deptId: filterDeptId === 'all' ? '' : filterDeptId,
    limit: 10 
  });
  const { data: categories } = useGetCategoriesQuery({});
  const { data: deptsData } = useGetDepartmentsQuery({ limit: 100 });
  const departments = deptsData?.departments || [];
  const { data: mappings, isLoading: isLoadingMappings } = useGetMappingsQuery(
    { schemeId: selectedSchemeId }, 
    { skip: !selectedSchemeId }
  );
  const { data: userData, isLoading: isLoadingUser } = useGetMeQuery();
  const isAdmin = userData?.user?.role === 'ADMIN';

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

  if (isLoadingUser) {
    return <div className="p-8"><Skeleton className="h-12 w-48 mb-4" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <div className="p-4 bg-red-50 rounded-full mb-4">
          <Info className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized Access</h2>
        <p className="text-gray-500 max-w-md">
          You do not have permission to view the mapping management page. Please contact your administrator for access.
        </p>
      </div>
    );
  }

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
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={t('searchScheme')}
                  value={schemeSearch}
                  onChange={(e) => setSchemeSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterDeptId} onValueChange={setFilterDeptId}>
                <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <SelectValue placeholder={t('filterByDepartment')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allDepartments')}</SelectItem>
                  {departments?.map((dept: any) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 max-h-[calc(100vh-20rem)] overflow-y-auto pr-2">
              {isLoadingSchemes ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
              ) : schemes.map((scheme: any) => (
                <div
                  key={scheme.id}
                  onClick={() => setSelectedSchemeId(scheme.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer relative group ${
                    selectedSchemeId === scheme.id 
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary' 
                      : 'hover:border-gray-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-[10px] font-mono font-medium text-primary bg-primary/5 px-1.5 py-0.5 rounded">
                      {scheme.scheme_code}
                    </div>
                    {scheme.mappings?.length > 0 && (
                      <div className="flex -space-x-1 overflow-hidden">
                        {scheme.mappings.slice(0, 3).map((m: any) => (
                          <div 
                            key={m.id} 
                            className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500 flex items-center justify-center text-[8px] text-white font-bold"
                            title={m.category.name}
                          >
                            {m.category.name.charAt(0)}
                          </div>
                        ))}
                        {scheme.mappings.length > 3 && (
                          <div className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 bg-slate-400 flex items-center justify-center text-[8px] text-white font-bold">
                            +{scheme.mappings.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-semibold truncate dark:text-gray-200 mb-1">{scheme.scheme_name}</div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{scheme.department.name}</div>
                  
                  {scheme.mappings?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {scheme.mappings.map((m: any) => (
                        <Badge 
                          key={m.id} 
                          variant="secondary" 
                          className="text-[9px] px-1 py-0 h-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors cursor-help"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingCategory(m.category);
                          }}
                        >
                          {m.category.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (scheme.mappings?.[0]) {
                        setViewingCategory(scheme.mappings[0].category);
                      }
                    }}
                    disabled={!scheme.mappings?.length}
                  >
                    <Info className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Add Mappings & View Existing */}
        <div className="lg:col-span-2 space-y-6">
          {selectedSchemeId ? (
            <>
              {isAdmin && (
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
              )}

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
                          {isAdmin && <TableHead className="text-right">{t('actions')}</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingMappings ? (
                          <TableRow><TableCell colSpan={isAdmin ? 3 : 2}><Skeleton className="h-20 w-full" /></TableCell></TableRow>
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
                              {isAdmin && (
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
                              )}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={isAdmin ? 3 : 2} className="h-24 text-center text-gray-500">
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
                          {isAdmin && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 h-8 w-8 p-0"
                              onClick={() => deleteMapping(mapping.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
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
      <CategoryDetailModal 
        category={viewingCategory} 
        isOpen={!!viewingCategory} 
        onClose={() => setViewingCategory(null)} 
      />
    </div>
  );
}
