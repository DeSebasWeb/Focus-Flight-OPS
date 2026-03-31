import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IRefreshTokenRepository, RefreshTokenData } from '../../../../domain/ports/outbound';

@Injectable()
export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    await this.prisma.refreshToken.create({ data });
  }

  async findByTokenHash(hash: string): Promise<RefreshTokenData | null> {
    return this.prisma.refreshToken.findFirst({
      where: { tokenHash: hash, revokedAt: null },
    });
  }

  async revokeByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeByTokenHash(hash: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
