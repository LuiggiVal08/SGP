import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ICareerRepository } from '../../../domain/ports/ICareerRepository';
import { CareerModel } from './models/career.model';
import { Career } from '../../../domain/entities/Career';

@Injectable()
export class CareerSequelizeAdapter implements ICareerRepository {
  constructor(
    @InjectModel(CareerModel)
    private readonly careerModel: typeof CareerModel,
  ) {}

  private toDomain(model: CareerModel | null): Career | null {
    if (!model) return null;
    return new Career(model.id, model.name);
  }

  async findById(id: string): Promise<Career | null> {
    const career = await this.careerModel.findByPk(id);
    return this.toDomain(career);
  }

  async findAll(): Promise<Career[]> {
    const careers = await this.careerModel.findAll();
    return careers.map((c) => new Career(c.id, c.name));
  }

  async save(career: Career): Promise<void> {
    await this.careerModel.upsert({
      id: career.id,
      name: career.name,
    });
  }
}
