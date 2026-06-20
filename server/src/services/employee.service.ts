import { employeeRepository } from '../repositories/employee.repository';
import { IEmployee } from '../models/Employee';

export class EmployeeService {
  async createEmployee(data: Partial<IEmployee>) {
    // Business logic goes here (e.g. checking if employeeId already exists, sending welcome emails)
    return employeeRepository.create(data);
  }

  async getEmployeeById(id: string) {
    return employeeRepository.findById(id, 'department');
  }

  async updateEmployee(id: string, data: Partial<IEmployee>) {
    return employeeRepository.updateById(id, data);
  }

  async deleteEmployee(id: string) {
    return employeeRepository.deleteById(id);
  }

  // Note: getEmployees is usually handled by the advancedResults middleware 
  // directly in the controller for pagination/filtering. 
  // For standard fetch, we could add a method here.
}

export const employeeService = new EmployeeService();
