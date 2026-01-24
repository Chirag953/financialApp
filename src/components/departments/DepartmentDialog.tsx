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
import { useTranslations } from 'next-intl';
import { useAddDepartmentMutation } from '@/store/services/api';

const departmentSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  nameHn: z.string().optional(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

interface DepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DepartmentDialog({ open, onOpenChange }: DepartmentDialogProps) {
  const t = useTranslations('Departments');
  const [addDepartment, { isLoading }] = useAddDepartmentMutation();

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

  const onSubmit = async (data: DepartmentFormValues) => {
    try {
      await addDepartment(data).unwrap();
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add department:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('addDept')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('nameEn')}</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g. Finance Department"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="nameHn">{t('nameHn')}</Label>
            <Input
              id="nameHn"
              {...register('nameHn')}
              placeholder="उदा. वित्त विभाग"
              className="font-hindi"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('saving') : t('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
