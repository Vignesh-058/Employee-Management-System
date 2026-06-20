import { BaseRepository } from './base.repository';
import Department, { IDepartment } from '../models/Department';

export class DepartmentRepository extends BaseRepository<IDepartment> {
  constructor() {
    super(Department);
  }
}

export const departmentRepository = new DepartmentRepository();
