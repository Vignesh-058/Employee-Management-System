export interface Department {
  _id: string;
  departmentName: string;
  manager: {
    _id: string;
    name: string;
    email: string;
  } | string | null;
  description?: string;
  budget?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentCreateInput {
  departmentName: string;
  manager?: string;
  description?: string;
  budget?: number;
}
