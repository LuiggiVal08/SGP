import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ICommunityPlaceRepository } from '../../domain/ports/ICommunityPlaceRepository';
import { CommunityPlace } from '../../domain/entities/CommunityPlace';

@Injectable()
export class CreateCommunityPlaceUseCase {
  constructor(
    @Inject('ICommunityPlaceRepository')
    private readonly communityPlaceRepository: ICommunityPlaceRepository,
  ) {}

  async execute(data: {
    institutionId: string;
    name: string;
    type: string;
    description?: string;
    address?: string;
    contactPhone?: string;
    contactEmail?: string;
  }) {
    const place = new CommunityPlace(
      randomUUID(),
      data.institutionId,
      data.name,
      data.type,
      data.description ?? null,
      data.address ?? null,
      data.contactPhone ?? null,
      data.contactEmail ?? null,
    );
    await this.communityPlaceRepository.save(place);
    return place;
  }
}
