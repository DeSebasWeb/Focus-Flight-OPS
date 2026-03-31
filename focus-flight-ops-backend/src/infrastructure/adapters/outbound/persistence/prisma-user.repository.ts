import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IUserRepository, UserData, CreateUserData } from '../../../../domain/ports/outbound';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserData | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserData | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByDocumentNumber(doc: string): Promise<UserData | null> {
    return this.prisma.user.findUnique({ where: { documentNumber: doc } });
  }

  async create(data: CreateUserData): Promise<UserData> {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: Partial<CreateUserData>): Promise<UserData> {
    return this.prisma.user.update({ where: { id }, data });
  }
}
