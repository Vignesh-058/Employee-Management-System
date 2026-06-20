export interface PayrollRecord {
  _id: string;
  employeeId: {
    _id: string;
    name: string;
    email: string;
    department: {
      departmentName: string;
    };
  } | string;
  basicSalary: number;
  bonus: number;
  deduction: number;
  netSalary: number;
  month: string;
  year: number;
  status: 'Pending' | 'Paid';
  paymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollInput {
  employeeId: string;
  basicSalary: number;
  bonus?: number;
  deduction?: number;
  month: string;
  year: number;
}
