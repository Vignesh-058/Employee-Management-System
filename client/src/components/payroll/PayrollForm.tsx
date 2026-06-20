import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
import { useCreatePayroll } from '../../hooks/usePayroll';

const payrollSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  basicSalary: z.coerce.number().min(0, 'Basic salary must be positive'),
  bonus: z.coerce.number().min(0).optional(),
  deduction: z.coerce.number().min(0).optional(),
  month: z.string().min(1, 'Month is required'),
  year: z.coerce.number().min(2000, 'Invalid year'),
});

type PayrollFormValues = z.infer<typeof payrollSchema>;

interface PayrollFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PayrollForm({ onSuccess, onCancel }: PayrollFormProps) {
  const createMutation = useCreatePayroll();

  const form = useForm<PayrollFormValues>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      employeeId: '',
      basicSalary: 0,
      bonus: 0,
      deduction: 0,
      month: new Date().toLocaleString('default', { month: 'short' }),
      year: new Date().getFullYear(),
    },
  });

  const onSubmit = async (data: PayrollFormValues) => {
    try {
      await createMutation.mutateAsync(data);
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to generate payroll', error);
    }
  };

  const isPending = createMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
        <FormField
          // @ts-ignore
          control={form.control}
          name="employeeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee ID</FormLabel>
              <FormControl>
                <Input placeholder="MongoDB ObjectId" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            // @ts-ignore
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Month</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Jan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            // @ts-ignore
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          // @ts-ignore
          control={form.control}
          name="basicSalary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Basic Salary ($)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            // @ts-ignore
            control={form.control}
            name="bonus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bonus ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            // @ts-ignore
            control={form.control}
            name="deduction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deduction ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Generating...' : 'Generate Payroll'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
