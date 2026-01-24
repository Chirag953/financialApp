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
import { useTranslations } from 'next-intl';
import { useAddSchemeMutation, useGetDepartmentsQuery } from '@/store/services/api';

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
}

export function SchemeDialog({ open, onOpenChange }: SchemeDialogProps) {
  const t = useTranslations('Schemes');
  const tCommon = useTranslations('Departments'); // Reusing common translations
  const [addScheme, { isLoading }] = useAddSchemeMutation();
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

  const onSubmit = async (data: SchemeFormValues) => {
    try {
      await addScheme(data).unwrap();
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add scheme:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t('newScheme')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheme_code">{t('code')}</Label>
              <Input
                id="scheme_code"
                {...register('scheme_code')}
                placeholder="13-digit code"
                maxLength={13}
                className={errors.scheme_code ? 'border-red-500' : ''}
              />
              {errors.scheme_code && (
                <p className="text-xs text-red-500">{errors.scheme_code.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheme_name">{t('name')}</Label>
              <Input
                id="scheme_name"
                {...register('scheme_name')}
                placeholder="Scheme Name"
                className={errors.scheme_name ? 'border-red-500' : ''}
              />
              {errors.scheme_name && (
                <p className="text-xs text-red-500">{errors.scheme_name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department_id">{tCommon('title')}</Label>
            <Select
              onValueChange={(value) => setValue('department_id', value)}
              defaultValue={watch('department_id')}
            >
              <SelectTrigger className={errors.department_id ? 'border-red-500' : ''}>
                <SelectValue placeholder={t('allDepartments')} />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept: any) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department_id && (
              <p className="text-xs text-red-500">{errors.department_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_budget_provision">{t('totalBudget')}</Label>
              <Input
                id="total_budget_provision"
                type="number"
                step="0.01"
                {...register('total_budget_provision', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="progressive_allotment">{t('allotment')}</Label>
              <Input
                id="progressive_allotment"
                type="number"
                step="0.01"
                {...register('progressive_allotment', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actual_progressive_expenditure">{t('expenditure')}</Label>
              <Input
                id="actual_progressive_expenditure"
                type="number"
                step="0.01"
                {...register('actual_progressive_expenditure', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provisional_expenditure_current_month">{t('provExp')}</Label>
              <Input
                id="provisional_expenditure_current_month"
                type="number"
                step="0.01"
                {...register('provisional_expenditure_current_month', { valueAsNumber: true })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? tCommon('saving') : tCommon('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
