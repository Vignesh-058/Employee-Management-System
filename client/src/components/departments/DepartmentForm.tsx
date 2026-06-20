import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Department } from '../../types/department.types';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useCreateDepartment, useUpdateDepartment } from '../../hooks/useDepartments';

const departmentSchema = z.object({
  departmentName: z.string().min(2, 'Department name must be at least 2 characters.'),
  description: z.string().optional(),
  budget: z.coerce.number().min(0, 'Budget must be a positive number.').optional(),
  manager: z.string().optional(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

interface DepartmentFormProps {
  initialData?: Department | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function DepartmentForm({ initialData, onSuccess, onCancel }: DepartmentFormProps) {
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();

  const form = useForm<DepartmentFormValues>({
    // @ts-ignore
    resolver: zodResolver(departmentSchema) as any,
    defaultValues: {
      departmentName: '',
      description: '',
      budget: 0,
      manager: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        departmentName: initialData.departmentName,
        description: initialData.description || '',
        budget: initialData.budget || 0,
        manager: typeof initialData.manager === 'string' ? initialData.manager : initialData.manager?._id || '',
      });
    } else {
      form.reset({
        departmentName: '',
        description: '',
        budget: 0,
        manager: '',
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: DepartmentFormValues) => {
    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData._id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to submit department', error);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    // @ts-ignore
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
        <FormField
          // @ts-ignore
          control={form.control}
          name="departmentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Engineering" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          // @ts-ignore
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Brief description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          // @ts-ignore
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Annual Budget ($)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="100000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : initialData ? 'Update Department' : 'Create Department'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
