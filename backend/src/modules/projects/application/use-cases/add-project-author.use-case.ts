import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { IStudentRepository } from '@modules/students/domain/ports/IStudentRepository';
import { ProjectAuthorModel } from '../../infrastructure/persistence/sequelize/models/project-author.model';

@Injectable()
export class AddProjectAuthorUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('IStudentRepository')
    private readonly studentRepository: IStudentRepository,
    @InjectModel(ProjectAuthorModel)
    private readonly authorModel: typeof ProjectAuthorModel,
  ) {}

  async execute(input: { projectId: string; studentId: string }) {
    const project = await this.projectRepository.findById(input.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const student = await this.studentRepository.findById(input.studentId);
    if (!student) {
      throw new BadRequestException('Student not found');
    }

    const existing = await this.authorModel.findOne({
      where: {
        projectId: input.projectId,
        studentId: input.studentId,
      },
    });
    if (existing) {
      throw new BadRequestException(
        'This student is already an author of the project',
      );
    }

    const count = await this.authorModel.count({
      where: { projectId: input.projectId },
    });
    if (count >= 3) {
      throw new BadRequestException('Maximum 3 authors per project');
    }

    const author = await this.authorModel.create({
      projectId: input.projectId,
      studentId: input.studentId,
    });

    return {
      id: author.id,
      projectId: author.projectId,
      studentId: author.studentId,
    };
  }
}
