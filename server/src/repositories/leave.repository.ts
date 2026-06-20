import { BaseRepository } from './base.repository';
import LeaveRequest, { ILeaveRequest } from '../models/LeaveRequest';

export class LeaveRepository extends BaseRepository<ILeaveRequest> {
  constructor() {
    super(LeaveRequest);
  }
}

export const leaveRepository = new LeaveRepository();
