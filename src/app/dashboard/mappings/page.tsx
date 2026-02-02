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
import { CategoryDetailModal } from '@/components/categories/CategoryDetailModal';

export default function MappingPage() {
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
        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-full mb-4 border border-red-100 dark:border-red-900/20">
          <Info className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Unauthorized Access</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          You do not have permission to view the mapping management page. Please contact your administrator for access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Scheme Mappings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage budget category mappings for financial schemes</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Step 1: Select Scheme */}
        <Card className="lg:col-span-1 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <CardTitle className="text-lg font-semibold flex items-center text-slate-800 dark:text-slate-200">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center mr-2 shadow-sm font-bold">1</span>
              Select Scheme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search schemes..."
                  value={schemeSearch}
                  onChange={(e) => setSchemeSearch(e.target.value)}
                  className="pl-10 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500"
                />
              </div>
              <Select value={filterDeptId} onValueChange={setFilterDeptId}>
                <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-emerald-500">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments?.map((dept: any) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 max-h-[calc(100vh-22rem)] overflow-y-auto pr-2 custom-scrollbar">
              {isLoadingSchemes ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
              ) : schemes.map((scheme: any) => (
                <div
                  key={scheme.id}
                  onClick={() => setSelectedSchemeId(scheme.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                    selectedSchemeId === scheme.id 
                      ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10 ring-1 ring-emerald-500 shadow-sm' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      {scheme.scheme_code}
                    </div>
                    {scheme.mappings?.length > 0 && (
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {scheme.mappings.slice(0, 3).map((m: any) => (
                          <div 
                            key={m.id} 
                            className="w-5.5 h-5.5 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500 flex items-center justify-center text-[8px] text-white font-bold shadow-sm"
                            title={m.category.name}
                          >
                            {m.category.name.charAt(0)}
                          </div>
                        ))}
                        {scheme.mappings.length > 3 && (
                          <div className="w-5.5 h-5.5 rounded-full border-2 border-white dark:border-slate-900 bg-slate-400 flex items-center justify-center text-[8px] text-white font-bold shadow-sm">
                            +{scheme.mappings.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">{scheme.scheme_name}</div>
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mr-1.5" />
                    {scheme.department.name}
                  </div>
                  
                  {scheme.mappings?.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {scheme.mappings.map((m: any) => (
                        <Badge 
                          key={m.id} 
                          variant="secondary" 
                          className="text-[9px] font-bold px-1.5 py-0 h-4.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-900/40 dark:hover:text-emerald-300 transition-colors cursor-help border border-slate-200 dark:border-slate-700"
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
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (scheme.mappings?.[0]) {
                        setViewingCategory(scheme.mappings[0].category);
                      }
                    }}
                    disabled={!scheme.mappings?.length}
                  >
                    <Info className="h-3.5 w-3.5" />
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
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <CardTitle className="text-lg font-semibold flex items-center text-slate-800 dark:text-slate-200">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center mr-2 shadow-sm font-bold">2</span>
                      Add New Mapping
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                      <div className="flex-1 space-y-2.5 w-full">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Budget Category</label>
                        <Select value={selectedCategoryId} onValueChange={(val) => { setSelectedCategoryId(val); setSelectedPartId(''); }}>
                          <SelectTrigger className="border-slate-200 dark:border-slate-800 focus:ring-emerald-500 h-11">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((cat: any) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedCategory?.has_parts && (
                        <div className="flex-1 space-y-2.5 w-full">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Category Part</label>
                          <Select value={selectedPartId} onValueChange={setSelectedPartId}>
                            <SelectTrigger className="border-slate-200 dark:border-slate-800 focus:ring-emerald-500 h-11">
                              <SelectValue placeholder="Select a part (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedCategory.parts.map((part: any) => (
                                <SelectItem key={part.id} value={part.id}>{part.part_name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <Button 
                        onClick={handleAddMapping} 
                        disabled={!selectedCategoryId || (selectedCategory?.has_parts && !selectedPartId) || isAdding}
                        className="w-full md:w-auto h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm transition-all active:scale-[0.98]"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Mapping
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">Existing Mappings</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                          <TableHead className="text-slate-900 dark:text-slate-100 font-bold px-6 py-4">Category</TableHead>
                          <TableHead className="text-slate-900 dark:text-slate-100 font-bold px-6 py-4">Part</TableHead>
                          {isAdmin && <TableHead className="text-right text-slate-900 dark:text-slate-100 font-bold px-6 py-4">Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingMappings ? (
                          <TableRow><TableCell colSpan={isAdmin ? 3 : 2} className="p-6"><Skeleton className="h-20 w-full rounded-xl" /></TableCell></TableRow>
                        ) : mappings?.length > 0 ? (
                          mappings.map((mapping: any) => (
                            <TableRow key={mapping.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
                              <TableCell className="font-bold text-slate-900 dark:text-slate-100 px-6 py-4">{mapping.category.name}</TableCell>
                              <TableCell className="px-6 py-4">
                                {mapping.part ? (
                                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 font-semibold px-2.5 py-0.5">
                                    {mapping.part.part_name}
                                  </Badge>
                                ) : (
                                  <span className="text-slate-400 dark:text-slate-500 text-xs font-medium italic">Not Applicable</span>
                                )}
                              </TableCell>
                              {isAdmin && (
                                <TableCell className="text-right px-6 py-4">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all rounded-lg"
                                    onClick={() => deleteMapping(mapping.id)}
                                  >
                                    <Trash2 className="w-4.5 h-4.5" />
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={isAdmin ? 3 : 2} className="h-40 text-center text-slate-500">
                              <div className="flex flex-col items-center justify-center space-y-3">
                                <Info className="w-10 h-10 text-slate-300" />
                                <div className="space-y-1">
                                  <p className="font-bold text-slate-900 dark:text-slate-100">No mappings found</p>
                                  <p className="text-sm">No budget categories have been mapped to this scheme yet.</p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4 p-4">
                    {isLoadingMappings ? (
                      Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
                    ) : mappings?.length > 0 ? (
                      mappings.map((mapping: any) => (
                        <div key={mapping.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all group">
                          <div className="space-y-1.5">
                            <div className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">{mapping.category.name}</div>
                            {mapping.part && (
                              <div className="flex items-center">
                                <div className="w-1 h-3 bg-emerald-500 rounded-full mr-2" />
                                <Badge variant="outline" className="text-[10px] font-bold h-5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800">
                                  {mapping.part.part_name}
                                </Badge>
                              </div>
                            )}
                          </div>
                          {isAdmin && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 h-10 w-10 p-0 rounded-full transition-all"
                              onClick={() => deleteMapping(mapping.id)}
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </Button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <Info className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="font-bold">No mappings found</p>
                        <p className="text-xs text-slate-400 mt-1">Start by adding a new mapping above.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-md mb-6 border border-slate-100 dark:border-slate-700 group hover:scale-110 transition-transform duration-300">
                <Info className="w-10 h-10 text-emerald-500/60 group-hover:text-emerald-500 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Scheme Selected</h3>
              <p className="text-slate-500 dark:text-slate-400 text-center max-w-xs mt-3 leading-relaxed">
                Please select a scheme from the list on the left to view or manage its budget category mappings.
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

