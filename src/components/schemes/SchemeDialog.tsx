'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAddSchemeMutation, useUpdateSchemeMutation, useGetDepartmentsQuery } from '@/store/services/api';
import { useEffect } from 'react';
import { toast } from 'sonner';

const schemeSchema = z.object({
  scheme_code: z.string().length(13, 'Scheme code must be exactly 13 digits'),
  scheme_name: z.string().min(3, 'Scheme name must be at least 3 characters'),
  total_budget_provision: z.number().min(0),
  progressive_allotment: z.number().min(0),
  actual_progressive_expenditure: z.number().min(0),
  provisional_expenditure_current_month: z.number().min(0),
  department_id: z.string().uuid('Please select a department'),
});

type SchemeFormValues = z.infer<typeof schemeSchema>;

interface SchemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheme?: any;
}

export function SchemeDialog({ open, onOpenChange, scheme }: SchemeDialogProps) {
  const [addScheme, { isLoading: isAdding }] = useAddSchemeMutation();
  const [updateScheme, { isLoading: isUpdating }] = useUpdateSchemeMutation();
  const { data: deptsData } = useGetDepartmentsQuery({ limit: 100 });
  const departments = deptsData?.departments || [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SchemeFormValues>({
    resolver: zodResolver(schemeSchema),
    defaultValues: {
      scheme_code: '',
      scheme_name: '',
      total_budget_provision: 0,
      progressive_allotment: 0,
      actual_progressive_expenditure: 0,
      provisional_expenditure_current_month: 0,
      department_id: '',
    },
  });

  useEffect(() => {
    if (scheme) {
      setValue('scheme_code', scheme.scheme_code);
      setValue('scheme_name', scheme.scheme_name);
      setValue('total_budget_provision', Number(scheme.total_budget_provision));
      setValue('progressive_allotment', Number(scheme.progressive_allotment));
      setValue('actual_progressive_expenditure', Number(scheme.actual_progressive_expenditure));
      setValue('provisional_expenditure_current_month', Number(scheme.provisional_expenditure_current_month));
      setValue('department_id', scheme.department_id);
    } else {
      reset({
        scheme_code: '',
        scheme_name: '',
        total_budget_provision: 0,
        progressive_allotment: 0,
        actual_progressive_expenditure: 0,
        provisional_expenditure_current_month: 0,
        department_id: '',
      });
    }
  }, [scheme, setValue, reset]);

  const onSubmit = async (data: SchemeFormValues) => {
    try {
      if (scheme) {
        await updateScheme({ id: scheme.id, body: data }).unwrap();
        toast.success('Scheme updated successfully');
      } else {
        await addScheme(data).unwrap();
        toast.success('Scheme created successfully');
      }
      reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to save scheme:', error);
      toast.error(error?.data?.error || 'Failed to save scheme');
    }
  };

  const isLoading = isAdding || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh] border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
            {scheme ? 'Edit Scheme' : 'New Scheme'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="scheme_code" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Scheme Code</Label>
              <Input
                id="scheme_code"
                {...register('scheme_code')}
                placeholder="13-digit code"
                maxLength={13}
                className={`h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all font-mono ${
                  errors.scheme_code ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                }`}
              />
              {errors.scheme_code && (
                <p className="text-xs font-medium text-red-500 mt-1">{errors.scheme_code.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheme_name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Scheme Name</Label>
              <Input
                id="scheme_name"
                {...register('scheme_name')}
                placeholder="Scheme Name"
                className={`h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all ${
                  errors.scheme_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                }`}
              />
              {errors.scheme_name && (
                <p className="text-xs font-medium text-red-500 mt-1">{errors.scheme_name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department_id" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Department</Label>
            <Select
              onValueChange={(value) => setValue('department_id', value)}
              defaultValue={watch('department_id')}
            >
              <SelectTrigger className={`h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all ${
                errors.department_id ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
              }`}>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent className="border-slate-200 dark:border-slate-800">
                {departments.map((dept: any) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department_id && (
              <p className="text-xs font-medium text-red-500 mt-1">{errors.department_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="total_budget_provision" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Budget</Label>
              <Input
                id="total_budget_provision"
                type="number"
                step="0.01"
                className="h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                {...register('total_budget_provision', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="progressive_allotment" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Allotment</Label>
              <Input
                id="progressive_allotment"
                type="number"
                step="0.01"
                className="h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                {...register('progressive_allotment', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actual_progressive_expenditure" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Expenditure</Label>
              <Input
                id="actual_progressive_expenditure"
                type="number"
                step="0.01"
                className="h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all font-bold text-emerald-600"
                {...register('actual_progressive_expenditure', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provisional_expenditure_current_month" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Provisional Exp.</Label>
              <Input
                id="provisional_expenditure_current_month"
                type="number"
                step="0.01"
                className="h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                {...register('provisional_expenditure_current_month', { valueAsNumber: true })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium h-11"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm h-11"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Saving...
                </span>
              ) : 'Save Scheme'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

