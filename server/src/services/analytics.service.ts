import Employee from '../models/Employee';
import Department from '../models/Department';
import Payroll from '../models/Payroll';
import Attendance from '../models/Attendance';
import LeaveRequest from '../models/LeaveRequest';

class AnalyticsService {
  async getDashboardKPIs() {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'Active' });
    const departments = await Department.countDocuments();
    
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const payrollData = await Payroll.aggregate([
      { $match: { month: currentMonth, year: currentYear } },
      { $group: { _id: null, totalCost: { $sum: '$netSalary' } } }
    ]);
    const payrollCost = payrollData.length > 0 ? payrollData[0].totalCost : 0;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayAttendance = await Attendance.countDocuments({ date: { $gte: startOfDay } });
    const attendanceRate = totalEmployees > 0 ? Math.round((todayAttendance / totalEmployees) * 100) : 0;

    const employeesOnLeave = await Attendance.countDocuments({ date: { $gte: startOfDay }, status: 'On Leave' });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newHires = await Employee.countDocuments({ joiningDate: { $gte: thirtyDaysAgo } });

    const pendingRequests = await LeaveRequest.countDocuments({ status: 'Pending' });

    return {
      totalEmployees,
      activeEmployees,
      departments,
      payrollCost,
      attendanceRate,
      employeesOnLeave,
      newHires,
      pendingRequests
    };
  }

  async getEmployeeGrowth() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);

    const growth = await Employee.aggregate([
      { $match: { joiningDate: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$joiningDate' },
            month: { $month: '$joiningDate' }
          },
          employees: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return growth.map(g => ({
      month: months[g._id.month - 1],
      employees: g.employees
    }));
  }

  async getDepartmentDistribution() {
    const distribution = await Employee.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'dept'
        }
      },
      { $unwind: '$dept' },
      {
        $group: {
          _id: '$dept.departmentName',
          employees: { $sum: 1 }
        }
      },
      { $project: { _id: 0, department: '$_id', employees: 1 } }
    ]);
    return distribution;
  }

  async getPayrollAnalytics() {
    const payrollTrends = await Payroll.aggregate([
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          totalBasic: { $sum: '$basicSalary' },
          totalBonus: { $sum: '$bonus' },
          totalDeductions: { $sum: '$deduction' },
          totalNet: { $sum: '$netSalary' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return payrollTrends.map(p => ({
      month: months[p._id.month - 1] || 'Unknown',
      Basic: p.totalBasic,
      Bonus: p.totalBonus,
      Deductions: p.totalDeductions,
      Net: p.totalNet
    }));
  }

  async getAttendanceAnalytics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendance = await Attendance.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$date' },
            month: { $month: '$date' }
          },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
          },
          onLeave: {
            $sum: { $cond: [{ $eq: ['$status', 'On Leave'] }, 1, 0] }
          },
          halfDay: {
            $sum: { $cond: [{ $eq: ['$status', 'Half Day'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.month': 1, '_id.day': 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return attendance.map(a => {
      const total = a.present + a.absent + a.onLeave + a.halfDay;
      const rate = total > 0 ? Math.round((a.present / total) * 100) : 0;
      return {
        date: `${a._id.day} ${months[a._id.month - 1]}`,
        Attendance: rate,
        Present: a.present,
        Absent: a.absent
      };
    });
  }

  async getLeaveAnalytics() {
    const leaves = await LeaveRequest.aggregate([
      {
        $group: {
          _id: '$leaveType',
          value: { $sum: 1 }
        }
      },
      { $project: { _id: 0, name: '$_id', value: 1 } }
    ]);
    return leaves;
  }

  async getHiringAnalytics() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const hires = await Employee.aggregate([
      { $match: { joiningDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$joiningDate' },
            month: { $month: '$joiningDate' }
          },
          newHires: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Resignations mockup based on inactive status since we don't have exitDate
    const inactive = await Employee.aggregate([
      { $match: { status: 'Inactive', updatedAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' }
          },
          resignations: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mergedMap = new Map();
    
    hires.forEach(h => {
      const key = `${h._id.month}-${h._id.year}`;
      mergedMap.set(key, { month: months[h._id.month - 1], NewHires: h.newHires, Resignations: 0, NetGrowth: h.newHires });
    });

    inactive.forEach(i => {
      const key = `${i._id.month}-${i._id.year}`;
      if (mergedMap.has(key)) {
        const item = mergedMap.get(key);
        item.Resignations = i.resignations;
        item.NetGrowth -= i.resignations;
      } else {
        mergedMap.set(key, { month: months[i._id.month - 1], NewHires: 0, Resignations: i.resignations, NetGrowth: -i.resignations });
      }
    });

    return Array.from(mergedMap.values());
  }

  async getSalaryDistribution() {
    const distribution = await Employee.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'dept'
        }
      },
      { $unwind: '$dept' },
      {
        $group: {
          _id: '$dept.departmentName',
          totalSalary: { $sum: '$salary' }
        }
      },
      { $project: { _id: 0, name: '$_id', size: '$totalSalary' } }
    ]);
    return distribution;
  }

  async getMonthlyExpenses() {
    // Just an approximation using payroll for now
    const payroll = await this.getPayrollAnalytics();
    return payroll.map((p: any) => ({
      name: p.month,
      Payroll: p.Net,
      Software: Math.round(p.Net * 0.1),
      Hardware: Math.round(p.Net * 0.05),
      Office: Math.round(p.Net * 0.15)
    }));
  }

  async getPerformanceAnalytics() {
    const perf = await Employee.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'dept'
        }
      },
      { $unwind: '$dept' },
      {
        $group: {
          _id: '$dept.departmentName',
          avgScore: { $avg: '$performanceScore' }
        }
      },
      { $project: { _id: 0, subject: '$_id', A: { $round: ['$avgScore', 0] }, fullMark: 100 } }
    ]);
    return perf.length > 0 ? perf : [{ subject: 'General', A: 0, fullMark: 100 }];
  }
}

export const analyticsService = new AnalyticsService();
