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
import { useAddDepartmentMutation, useUpdateDepartmentMutation } from '@/store/services/api';
import { useEffect } from 'react';

const departmentSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  nameHn: z.string().optional(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

interface DepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: {
    id: string;
    name: string;
    nameHn: string;
  } | null;
}

export function DepartmentDialog({ open, onOpenChange, department }: DepartmentDialogProps) {
  const [addDepartment, { isLoading: isAdding }] = useAddDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdating }] = useUpdateDepartmentMutation();
  const isLoading = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      nameHn: '',
    },
  });

  useEffect(() => {
    if (department) {
      reset({
        name: department.name,
        nameHn: department.nameHn || '',
      });
    } else {
      reset({
        name: '',
        nameHn: '',
      });
    }
  }, [department, reset]);

  const onSubmit = async (data: DepartmentFormValues) => {
    try {
      if (department) {
        await updateDepartment({ id: department.id, body: data }).unwrap();
      } else {
        await addDepartment(data).unwrap();
      }
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save department:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
            {department ? 'Edit Department' : 'Add Department'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Department Name
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g. Finance Department"
              className={`h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all ${
                errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
              }`}
            />
            {errors.name && (
              <p className="text-xs font-medium text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Saving...
                </span>
              ) : 'Save Department'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

