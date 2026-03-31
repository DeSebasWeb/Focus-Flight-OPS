import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IChecklistRepository, ChecklistTemplateData, ChecklistExecutionData, CreateChecklistExecutionData, ChecklistExecutionItemData } from '../../../../domain/ports/outbound';

@Injectable()
export class PrismaChecklistRepository implements IChecklistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findTemplateByType(type: string): Promise<ChecklistTemplateData | null> {
    const template = await this.prisma.checklistTemplate.findFirst({
      where: { type, isActive: true },
      include: {
        items: {
          include: { category: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
    if (!template) return null;
    return {
      ...template,
      items: template.items.map((i) => ({
        ...i,
        categoryCode: i.category?.code,
      })),
    };
  }

  async findAllActiveTemplates(): Promise<ChecklistTemplateData[]> {
    const templates = await this.prisma.checklistTemplate.findMany({
      where: { isActive: true },
      include: {
        items: {
          include: { category: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
    return templates.map((t) => ({
      ...t,
      items: t.items.map((i) => ({
        ...i,
        categoryCode: i.category?.code,
      })),
    }));
  }

  async findExecutionById(id: string): Promise<ChecklistExecutionData | null> {
    const exec = await this.prisma.checklistExecution.findUnique({
      where: { id },
      include: { items: true },
    });
    return exec as ChecklistExecutionData | null;
  }

  async findExecutionsByMissionId(missionId: string): Promise<ChecklistExecutionData[]> {
    const execs = await this.prisma.checklistExecution.findMany({
      where: { missionId },
      include: { items: true },
      orderBy: { startedAt: 'asc' },
    });
    return execs as ChecklistExecutionData[];
  }

  async createExecution(data: CreateChecklistExecutionData): Promise<ChecklistExecutionData> {
    const exec = await this.prisma.checklistExecution.create({
      data: {
        missionId: data.missionId,
        templateId: data.templateId,
        pilotId: data.pilotId,
        startedAt: data.startedAt,
        status: 'IN_PROGRESS',
        items: {
          create: data.items.map((item) => ({
            templateItemId: item.templateItemId,
            isChecked: false,
          })),
        },
      },
      include: { items: true },
    });
    return exec as ChecklistExecutionData;
  }

  async updateExecution(id: string, data: { status: string; isPassed?: boolean; completedAt?: Date }): Promise<ChecklistExecutionData> {
    const exec = await this.prisma.checklistExecution.update({
      where: { id },
      data,
      include: { items: true },
    });
    return exec as ChecklistExecutionData;
  }

  async updateExecutionItem(id: string, data: Partial<ChecklistExecutionItemData>): Promise<void> {
    const { id: _, executionId, templateItemId, ...updateData } = data as any;
    await this.prisma.checklistExecutionItem.update({
      where: { id },
      data: updateData,
    });
  }
}
