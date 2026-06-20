import { payrollRepository } from '../repositories/payroll.repository';

class PayrollService {
  async createPayroll(data: any) {
    return payrollRepository.create(data);
  }

  async getStats() {
    return payrollRepository.getStats();
  }
}

export const payrollService = new PayrollService();
