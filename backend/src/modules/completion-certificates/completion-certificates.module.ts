import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CompletionCertificateModel } from './infrastructure/persistence/sequelize/models/completion-certificate.model';
import { CompletionCertificateSequelizeAdapter } from './infrastructure/persistence/sequelize/completion-certificate-sequelize.adapter';
import { CompletionCertificateService } from './application/services/completion-certificate.service';
import { CompletionCertificateController } from './infrastructure/http/completion-certificate.controller';
import { ProjectAuthorModel } from '@modules/projects/infrastructure/persistence/sequelize/models/project-author.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      CompletionCertificateModel,
      ProjectAuthorModel,
    ]),
  ],
  providers: [
    {
      provide: 'ICompletionCertificateRepository',
      useClass: CompletionCertificateSequelizeAdapter,
    },
    CompletionCertificateService,
  ],
  controllers: [CompletionCertificateController],
  exports: ['ICompletionCertificateRepository'],
})
export class CompletionCertificatesModule {}
