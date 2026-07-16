import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CompletionCertificateModel } from './infrastructure/persistence/sequelize/models/completion-certificate.model';
import { CompletionCertificateSequelizeAdapter } from './infrastructure/persistence/sequelize/completion-certificate-sequelize.adapter';
import { GenerateCompletionCertificateUseCase } from './application/use-cases/generate-completion-certificate.use-case';
import { GetCompletionCertificatesUseCase } from './application/use-cases/get-completion-certificates.use-case';
import { GetByAuthorUseCase } from './application/use-cases/get-by-author.use-case';
import { GetByIdUseCase } from './application/use-cases/get-by-id.use-case';
import { CompletionCertificateController } from './infrastructure/http/controllers/completion-certificate.controller';
import { CartaPdfService } from '@modules/projects/infrastructure/services/carta-pdf.service';
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [
    SequelizeModule.forFeature([CompletionCertificateModel]),
    UsersModule,
  ],
  providers: [
    {
      provide: 'ICompletionCertificateRepository',
      useClass: CompletionCertificateSequelizeAdapter,
    },
    CartaPdfService,
    GenerateCompletionCertificateUseCase,
    GetCompletionCertificatesUseCase,
    GetByAuthorUseCase,
    GetByIdUseCase,
  ],
  controllers: [CompletionCertificateController],
  exports: ['ICompletionCertificateRepository'],
})
export class CompletionCertificatesModule {}
