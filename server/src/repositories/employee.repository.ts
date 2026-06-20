import { BaseRepository } from './base.repository';
import Employee, { IEmployee } from '../models/Employee';

export class EmployeeRepository extends BaseRepository<IEmployee> {
  constructor() {
    super(Employee);
  }
}

export const employeeRepository = new EmployeeRepository();
