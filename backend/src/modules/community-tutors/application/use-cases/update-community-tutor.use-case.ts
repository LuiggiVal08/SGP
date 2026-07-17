import { Injectable, Inject } from '@nestjs/common';
import { ICommunityTutorRepository } from '../../domain/ports/ICommunityTutorRepository';
import { CommunityTutor } from '../../domain/entities/CommunityTutor';

@Injectable()
export class UpdateCommunityTutorUseCase {
  constructor(
    @Inject('ICommunityTutorRepository')
    private readonly communityTutorRepository: ICommunityTutorRepository,
  ) {}

  async execute(
    id: string,
    data: {
      locationId?: string;
      fullName?: string;
      dni?: string;
      phone?: string;
      email?: string;
      position?: string;
    },
  ) {
    const existing = await this.communityTutorRepository.findById(id);
    if (!existing) {
      throw new Error('COMMUNITY_TUTOR_NOT_FOUND');
    }
    const updated = new CommunityTutor(
      existing.id,
      data.locationId ?? existing.locationId,
      data.fullName !== undefined ? data.fullName : existing.fullName,
      data.dni !== undefined ? data.dni : existing.dni,
      data.phone !== undefined ? data.phone : existing.phone,
      data.email !== undefined ? data.email : existing.email,
      data.position !== undefined ? data.position : existing.position,
    );
    await this.communityTutorRepository.save(updated);
    return updated;
  }
}
