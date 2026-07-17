import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ProjectAuthorModel } from '../../infrastructure/persistence/sequelize/models/project-author.model';
import { StudentModel } from '@modules/students/infrastructure/persistence/sequelize/models/student.model';
import { UserModel } from '@modules/users/infrastructure/persistence/sequelize/models/user.model';

@Injectable()
export class ListProjectAuthorsUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @InjectModel(ProjectAuthorModel)
    private readonly authorModel: typeof ProjectAuthorModel,
  ) {}

  async execute(projectId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const authors = await this.authorModel.findAll({
      where: { projectId },
      include: [
        {
          model: StudentModel,
          include: [
            {
              model: UserModel,
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
          ],
        },
      ],
    });

    return authors.map((a) => ({
      id: a.id,
      projectId: a.projectId,
      studentId: a.studentId,
      student: a.student
        ? {
            id: a.student.id,
            enrollmentNumber: a.student.enrollmentNumber,
            user: a.student.user
              ? {
                  id: a.student.user.id,
                  firstName: a.student.user.firstName,
                  lastName: a.student.user.lastName,
                  email: a.student.user.email,
                }
              : undefined,
          }
        : undefined,
    }));
  }
}
