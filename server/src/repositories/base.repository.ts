import mongoose, { Model, Document, UpdateQuery } from 'mongoose';

export class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: any): Promise<T> {
    return this.model.create(data);
  }

  async findById(id: string, populate?: string): Promise<T | null> {
    const query = this.model.findById(id);
    if (populate) query.populate(populate);
    return query.exec();
  }

  async findOne(filter: Record<string, any>, populate?: string): Promise<T | null> {
    const query = this.model.findOne(filter);
    if (populate) query.populate(populate);
    return query.exec();
  }

  async find(filter: Record<string, any> = {}, populate?: string): Promise<T[]> {
    const query = this.model.find(filter);
    if (populate) query.populate(populate);
    return query.exec();
  }

  async updateById(id: string, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec();
  }

  async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async countDocuments(filter: Record<string, any> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
}
