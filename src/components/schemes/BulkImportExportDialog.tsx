'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useImportSchemesMutation, useGetDepartmentsQuery } from '@/store/services/api';
import { toast } from 'sonner';
import { Download, Upload, FileDown, Loader2, AlertCircle, CheckCircle2, Building2 } from 'lucide-react';
import Link from 'next/link';

interface BulkImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkImportExportDialog({ open, onOpenChange }: BulkImportExportDialogProps) {
  const [importSchemes, { isLoading: isImporting }] = useImportSchemesMutation();
  const { data: deptsData } = useGetDepartmentsQuery({ limit: 100 });
  const departments = deptsData?.departments || [];

  const [mode, setMode] = useState<'options' | 'import' | 'summary'>('options');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{ successCount: number; errorCount: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const headers = [
      'scheme_code',
      'scheme_name',
      'total_budget_provision',
      'progressive_allotment',
      'actual_progressive_expenditure_upto_dec',
      'percent_budget_expenditure',
      'percent_actual_expenditure',
      'provisional_expenditure_current_month'
    ];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "scheme_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    window.location.href = '/api/schemes/bulk-export';
    toast.success('Schemes exported successfully');
    onOpenChange(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please upload a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (selectedDeptId) {
      formData.append('deptId', selectedDeptId);
    }

    try {
      const result = await importSchemes(formData).unwrap();
      setImportResult(result);
      setMode('summary');
      toast.success(`Imported ${result.successCount} schemes successfully, ${result.errorCount} failed.`);
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.data?.error || 'Failed to import schemes');
    }
  };

  const resetState = () => {
    setMode('options');
    setSelectedFile(null);
    setSelectedDeptId('');
    setImportResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) setTimeout(resetState, 300);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Import/Export</DialogTitle>
        </DialogHeader>

        {mode === 'options' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6">
            <Button 
              variant="outline" 
              className="h-32 flex flex-col gap-3 border-2 border-dashed hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              onClick={() => setMode('import')}
            >
              <Upload className="w-8 h-8 text-blue-600" />
              <span className="font-semibold">Import Schemes</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-32 flex flex-col gap-3 border-2 border-dashed hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
              onClick={handleExport}
            >
              <Download className="w-8 h-8 text-green-600" />
              <span className="font-semibold">Export Schemes</span>
            </Button>
          </div>
        )}

        {mode === 'import' && (
          <div className="space-y-6 py-4">
            {departments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed">
                <Building2 className="w-12 h-12 text-slate-400" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                    No Departments Found
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[300px]">
                    Please add at least one department before importing schemes.
                  </p>
                </div>
                <Link href="/dashboard/departments">
                  <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                    Add Department
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Select Department for New Schemes</Label>
                    <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept: any) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedDeptId ? (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30 text-sm space-y-3 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-start gap-3">
                        <FileDown className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-blue-900 dark:text-blue-100 font-medium">
                            Download Template
                          </p>
                          <p className="text-blue-700/80 dark:text-blue-300/80 text-xs">
                            Download the CSV template with the correct headers for importing schemes.
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full bg-white dark:bg-slate-800 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700" 
                        onClick={handleDownloadTemplate}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download CSV Template
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-dashed text-center">
                      <p className="text-xs text-slate-500 italic">
                        Select a department above to download the import template
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Upload CSV File</Label>
                    <div 
                      className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                        selectedFile 
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className={`p-3 rounded-full ${selectedFile ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          CSV files only
                        </p>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".csv" 
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {mode === 'summary' && importResult && (
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-900 dark:text-green-100">Import Summary</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Imported {importResult.successCount} schemes successfully, {importResult.errorCount} failed.
                </p>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-600 font-medium text-sm">
                  <AlertCircle className="w-4 h-4" />
                  View Errors ({importResult.errorCount})
                </div>
                <div className="max-h-[200px] overflow-y-auto border rounded-md p-3 bg-red-50 dark:bg-red-900/10 space-y-1">
                  {importResult.errors.map((err, i) => (
                    <div key={i} className="text-xs text-red-700 dark:text-red-400 font-mono">
                      • {err}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {mode === 'options' ? (
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          ) : mode === 'import' ? (
            <>
              <Button variant="ghost" onClick={() => setMode('options')} disabled={isImporting}>Cancel</Button>
              <Button 
                onClick={handleImport} 
                disabled={isImporting || !selectedFile}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isImporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isImporting ? 'Uploading...' : 'Import Schemes'}
              </Button>
            </>
          ) : (
            <Button onClick={() => onOpenChange(false)} className="w-full">Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

