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
import { useAddCategoryMutation, useUpdateCategoryMutation } from '@/store/services/api';
import { toast } from 'sonner';
import { useEffect } from 'react';

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
  category?: any;
}

export function CategoryDialog({ open, onOpenChange, category }: CategoryDialogProps) {
  const [addCategory, { isLoading: isAdding }] = useAddCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  
  const isLoading = isAdding || isUpdating;

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

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        has_parts: category.has_parts,
        parts: category.parts?.map((p: any) => ({ part_name: p.part_name })) || [],
      });
    } else {
      reset({
        name: '',
        has_parts: false,
        parts: [],
      });
    }
  }, [category, reset, open]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'parts',
  });

  const hasParts = watch('has_parts');

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      const payload = {
        name: data.name,
        has_parts: data.has_parts,
        parts: data.has_parts ? data.parts?.map(p => p.part_name) : [],
      };

      if (category) {
        await updateCategory({ id: category.id, body: payload }).unwrap();
        toast.success('Category updated successfully');
      } else {
        await addCategory(payload).unwrap();
        toast.success('Category created successfully');
      }
      reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to save category:', error);
      const errorMessage = error?.data?.error;
      const details = Array.isArray(errorMessage) 
        ? errorMessage.map((e: any) => e.message).join(', ')
        : (typeof errorMessage === 'string' ? errorMessage : 'Failed to save category');
      toast.error(details);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
            {category ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Category Name
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g. Social Welfare"
                className={`h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all ${
                  errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                }`}
              />
              {errors.name && (
                <p className="text-xs font-medium text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="space-y-0.5">
                <Label htmlFor="has_parts" className="text-sm font-semibold text-slate-900 dark:text-white">
                  Sub-categories
                </Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Does this category have sub-categories?
                </p>
              </div>
              <Switch
                id="has_parts"
                checked={hasParts}
                onCheckedChange={(checked) => {
                  setValue('has_parts', checked);
                  if (checked && fields.length === 0) {
                    append({ part_name: '' });
                  }
                }}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>

            {hasParts && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Sub-categories List
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ part_name: '' })}
                    className="h-8 text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Sub-category
                  </Button>
                </div>

                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 group animate-in fade-in slide-in-from-right-2 duration-200">
                      <div className="relative flex-1">
                        <Input
                          {...register(`parts.${index}.part_name`)}
                          placeholder="Sub-category name"
                          className="h-10 border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {fields.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <p className="text-sm text-slate-500">No sub-categories added yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
            >
              {isLoading ? 'Saving...' : category ? 'Save Changes' : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

