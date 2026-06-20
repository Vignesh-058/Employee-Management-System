import { departmentRepository } from '../repositories/department.repository';
import { IDepartment } from '../models/Department';

export class DepartmentService {
  async createDepartment(data: Partial<IDepartment>) {
    return departmentRepository.create(data);
  }

  async getDepartmentById(id: string) {
    return departmentRepository.findById(id, 'manager');
  }

  async updateDepartment(id: string, data: Partial<IDepartment>) {
    return departmentRepository.updateById(id, data);
  }

  async deleteDepartment(id: string) {
    return departmentRepository.deleteById(id);
  }
}

export const departmentService = new DepartmentService();
