import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ICommunityTutorRepository } from '../../domain/ports/ICommunityTutorRepository';
import { CommunityTutor } from '../../domain/entities/CommunityTutor';

@Injectable()
export class CreateCommunityTutorUseCase {
  constructor(
    @Inject('ICommunityTutorRepository')
    private readonly communityTutorRepository: ICommunityTutorRepository,
  ) {}

  async execute(data: {
    locationId: string;
    fullName?: string;
    dni?: string;
    phone?: string;
    email?: string;
    position?: string;
  }) {
    const tutor = new CommunityTutor(
      randomUUID(),
      data.locationId,
      data.fullName ?? null,
      data.dni ?? null,
      data.phone ?? null,
      data.email ?? null,
      data.position ?? null,
    );
    await this.communityTutorRepository.save(tutor);
    return tutor;
  }
}
