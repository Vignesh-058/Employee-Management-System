import { BaseRepository } from './base.repository';
import User, { IUser } from '../models/User';

class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email });
  }
}

export const userRepository = new UserRepository();
