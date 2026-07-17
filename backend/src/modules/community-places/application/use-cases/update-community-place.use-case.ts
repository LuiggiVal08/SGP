import { Injectable, Inject } from '@nestjs/common';
import { ICommunityPlaceRepository } from '../../domain/ports/ICommunityPlaceRepository';
import { CommunityPlace } from '../../domain/entities/CommunityPlace';

@Injectable()
export class UpdateCommunityPlaceUseCase {
  constructor(
    @Inject('ICommunityPlaceRepository')
    private readonly communityPlaceRepository: ICommunityPlaceRepository,
  ) {}

  async execute(
    id: string,
    data: {
      institutionId?: string;
      name?: string;
      type?: string;
      description?: string;
      address?: string;
      contactPhone?: string;
      contactEmail?: string;
    },
  ) {
    const existing = await this.communityPlaceRepository.findById(id);
    if (!existing) {
      throw new Error('COMMUNITY_PLACE_NOT_FOUND');
    }
    const updated = new CommunityPlace(
      existing.id,
      data.institutionId ?? existing.institutionId,
      data.name ?? existing.name,
      data.type ?? existing.type,
      data.description !== undefined ? data.description : existing.description,
      data.address !== undefined ? data.address : existing.address,
      data.contactPhone !== undefined
        ? data.contactPhone
        : existing.contactPhone,
      data.contactEmail !== undefined
        ? data.contactEmail
        : existing.contactEmail,
    );
    await this.communityPlaceRepository.save(updated);
    return updated;
  }
}
