import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { IInstitutionRepository } from '../../../domain/ports/IInstitutionRepository';
import { InstitutionModel } from './models/institution.model';
import { Institution } from '../../../domain/entities/Institution';

@Injectable()
export class InstitutionSequelizeAdapter implements IInstitutionRepository {
  constructor(
    @InjectModel(InstitutionModel)
    private readonly institutionModel: typeof InstitutionModel,
  ) {}

  private toDomain(model: InstitutionModel | null): Institution | null {
    if (!model) return null;
    return new Institution(
      model.id,
      model.name,
      model.acronym,
      model.email,
      model.contactInfo,
    );
  }

  async findById(id: string): Promise<Institution | null> {
    const inst = await this.institutionModel.findByPk(id);
    return this.toDomain(inst);
  }

  async findByCoordinatorId(professorId: string): Promise<Institution | null> {
    const inst = await this.institutionModel.findOne({
      where: { coordinatorId: professorId },
    });
    return this.toDomain(inst);
  }

  async findAll(): Promise<Institution[]> {
    const insts = await this.institutionModel.findAll();
    return insts.map(
      (i) => new Institution(i.id, i.name, i.acronym, i.email, i.contactInfo),
    );
  }

  async save(institution: Institution): Promise<void> {
    await this.institutionModel.upsert({
      id: institution.id,
      name: institution.name,
      acronym: institution.acronym,
      email: institution.email,
      contactInfo: institution.contactInfo,
    });
  }

  async delete(id: string): Promise<void> {
    await this.institutionModel.destroy({ where: { id } });
  }
}
