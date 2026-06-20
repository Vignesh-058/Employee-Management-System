import { BaseRepository } from './base.repository';
import Payroll, { IPayroll } from '../models/Payroll';

class PayrollRepository extends BaseRepository<IPayroll> {
  constructor() {
    super(Payroll);
  }

  async getStats() {
    return this.model.aggregate([
      {
        $group: {
          _id: '$month',
          totalSalary: { $sum: '$netSalary' },
          totalBonus: { $sum: '$bonus' },
          totalDeductions: { $sum: '$deduction' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }
}

export const payrollRepository = new PayrollRepository();
