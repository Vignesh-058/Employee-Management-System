import { EmployeeService } from './employee.service';
import { employeeRepository } from '../repositories/employee.repository';

jest.mock('../repositories/employee.repository');

describe('EmployeeService', () => {
  let employeeService: EmployeeService;

  beforeEach(() => {
    employeeService = new EmployeeService();
    jest.clearAllMocks();
  });

  describe('createEmployee', () => {
    it('should create an employee successfully', async () => {
      const mockData = { name: 'John Doe', email: 'john@example.com' };
      const mockCreatedEmployee = { _id: '1', ...mockData };
      
      (employeeRepository.create as jest.Mock).mockResolvedValue(mockCreatedEmployee);

      const result = await employeeService.createEmployee(mockData);

      expect(employeeRepository.create).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockCreatedEmployee);
    });
  });

  describe('getEmployeeById', () => {
    it('should retrieve an employee by id', async () => {
      const mockId = '1';
      const mockEmployee = { _id: mockId, name: 'John Doe' };

      (employeeRepository.findById as jest.Mock).mockResolvedValue(mockEmployee);

      const result = await employeeService.getEmployeeById(mockId);

      expect(employeeRepository.findById).toHaveBeenCalledWith(mockId, 'department');
      expect(result).toEqual(mockEmployee);
    });
  });
});
