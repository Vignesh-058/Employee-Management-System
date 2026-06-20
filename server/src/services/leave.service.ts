import { leaveRepository } from '../repositories/leave.repository';
import { ILeaveRequest } from '../models/LeaveRequest';
import AuditLog from '../models/AuditLog';
import { emitToRole } from '../socket/socket';

export class LeaveService {
  async applyLeave(data: Partial<ILeaveRequest> & { employeeId?: any }) {
    const leave = await leaveRepository.create(data);

    // Notify HR Manager role in real-time
    try {
      emitToRole('HR Manager', 'leave:newRequest', {
        message: `New leave request submitted`,
        leaveId: leave._id,
      });
      emitToRole('Super Admin', 'leave:newRequest', {
        message: `New leave request submitted`,
        leaveId: leave._id,
      });
    } catch (_e) {
      // silent fail outside socket context
    }

    return leave;
  }

  async getLeaveById(id: string) {
    return leaveRepository.findById(id, 'employeeId approvedBy');
  }

  async updateLeaveStatus(id: string, status: 'Approved' | 'Rejected', approvedBy: string) {
    const leave = await leaveRepository.updateById(id, { status, approvedBy });

    if (leave) {
      // Audit
      await AuditLog.create({
        userId: approvedBy,
        action: status === 'Approved' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
        details: `Leave request ${id} was ${status.toLowerCase()}`,
      });

      // Notify employee
      try {
        const anyLeave = leave as any;
        if (anyLeave.employeeId) {
          emitToRole('Employee', 'leave:statusUpdate', {
            leaveId: id,
            status,
            message: `Your leave request has been ${status.toLowerCase()}`,
          });
        }
      } catch (_e) {
        // silent fail
      }
    }

    return leave;
  }

  async deleteLeave(id: string) {
    return leaveRepository.deleteById(id);
  }
}

export const leaveService = new LeaveService();
