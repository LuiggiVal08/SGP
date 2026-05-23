// src/share/infrastructure/adapters/redis-cache.adapter.ts
import { Injectable, Inject } from '@nestjs/common';
import { ICacheService } from '@share/domain/ports/ICacheService';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheAdapter implements ICacheService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis, // 👈 Inyección 100% tipada
  ) {}

  async get(key: string): Promise<string | null> {
    const result = await this.redisClient.get(key);
    return result;
  }

  async set(key: string, value: string, ttl: number = 3600): Promise<void> {
    await this.redisClient.set(key, value, 'EX', ttl);
  }
}
