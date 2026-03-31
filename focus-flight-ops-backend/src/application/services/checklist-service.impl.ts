import { Inject, Injectable } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { IChecklistRepository } from '../../domain/ports/outbound';
import { IChecklistService, StartChecklistInput, CheckItemInput } from '../../domain/ports/inbound';
import { EntityNotFoundError, ChecklistIncompleteError } from '../../domain/errors';

@Injectable()
export class ChecklistServiceImpl implements IChecklistService {
  constructor(
    @Inject(INJECTION_TOKENS.ChecklistRepository) private readonly checklistRepo: IChecklistRepository,
  ) {}

  async getTemplates() {
    return this.checklistRepo.findAllActiveTemplates();
  }

  async getTemplateByType(type: string) {
    const template = await this.checklistRepo.findTemplateByType(type);
    if (!template) throw new EntityNotFoundError('ChecklistTemplate', type);
    return template;
  }

  async startExecution(data: StartChecklistInput) {
    const template = await this.getTemplateByType(data.templateType);

    return this.checklistRepo.createExecution({
      missionId: data.missionId,
      templateId: template.id,
      pilotId: data.pilotId,
      startedAt: new Date(),
      items: template.items.map((i) => ({ templateItemId: i.id })),
    });
  }

  async checkItem(executionId: string, itemId: string, data: CheckItemInput) {
    const execution = await this.checklistRepo.findExecutionById(executionId);
    if (!execution) throw new EntityNotFoundError('ChecklistExecution', executionId);

    await this.checklistRepo.updateExecutionItem(itemId, {
      isChecked: data.isChecked,
      checkedAt: data.isChecked ? new Date() : null,
      note: data.note,
      photoUrl: data.photoUrl,
    });
  }

  async finalizeExecution(executionId: string) {
    const execution = await this.checklistRepo.findExecutionById(executionId);
    if (!execution) throw new EntityNotFoundError('ChecklistExecution', executionId);

    const template = await this.checklistRepo.findTemplateByType('');
    // Get critical items from the template
    const allTemplates = await this.checklistRepo.findAllActiveTemplates();
    const myTemplate = allTemplates.find((t) => t.id === execution.templateId);

    if (myTemplate) {
      const criticalItemIds = myTemplate.items
        .filter((i) => i.isCritical)
        .map((i) => i.id);

      const uncheckedCritical = criticalItemIds.filter((critId) =>
        !execution.items.find((ei) => ei.templateItemId === critId && ei.isChecked),
      );

      if (uncheckedCritical.length > 0) {
        throw new ChecklistIncompleteError(myTemplate.nameEs, uncheckedCritical.length);
      }
    }

    return this.checklistRepo.updateExecution(executionId, {
      status: 'PASSED',
      isPassed: true,
      completedAt: new Date(),
    });
  }

  async findExecutionsByMission(missionId: string) {
    return this.checklistRepo.findExecutionsByMissionId(missionId);
  }
}
