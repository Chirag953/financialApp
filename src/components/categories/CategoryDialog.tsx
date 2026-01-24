'use client';

import { useForm, useFieldArray } from 'react-hook-form';
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
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAddCategoryMutation } from '@/store/services/api';

const categorySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  has_parts: z.boolean(),
  parts: z.array(z.object({
    part_name: z.string().min(1, 'Part name is required')
  })).optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryDialog({ open, onOpenChange }: CategoryDialogProps) {
  const t = useTranslations('Categories');
  const tCommon = useTranslations('Departments'); // Reusing saving/cancel/save
  const [addCategory, { isLoading }] = useAddCategoryMutation();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      has_parts: false,
      parts: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'parts',
  });

  const hasParts = watch('has_parts');

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      await addCategory({
        name: data.name,
        has_parts: data.has_parts,
        parts: data.has_parts ? data.parts?.map(p => p.part_name) : [],
      }).unwrap();
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t('addCategory')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('configuration')}</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g. Gender Budget"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="has_parts">{t('hasParts')}</Label>
            <Switch
              id="has_parts"
              checked={hasParts}
              onCheckedChange={(checked) => {
                setValue('has_parts', checked);
                if (checked && fields.length === 0) {
                  append({ part_name: '' });
                }
              }}
            />
          </div>

          {hasParts && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-gray-400 uppercase">{t('definedParts')}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ part_name: '' })}
                  className="h-7 px-2"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Part
                </Button>
              </div>
              
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      {...register(`parts.${index}.part_name` as const)}
                      placeholder={`Part ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      disabled={fields.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
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
