import { ChecklistExecution, ChecklistExecutionItemProps } from '../../../core/entities';
import { ChecklistType } from '../../../core/enums';
import { IChecklistRepository } from '../../../core/ports/outbound';

export class StartChecklistUseCase {
  constructor(private readonly checklistRepo: IChecklistRepository) {}

  async execute(missionId: string, type: ChecklistType, pilotId: string): Promise<ChecklistExecution> {
    const template = await this.checklistRepo.findTemplateByType(type);
    if (!template) {
      throw new Error(`No active checklist template found for type: ${type}`);
    }

    const items: ChecklistExecutionItemProps[] = template.props.items.map((templateItem) => ({
      id: crypto.randomUUID(),
      executionId: '', // Will be set after execution creation
      templateItemId: templateItem.id,
      isChecked: false,
    }));

    const executionId = crypto.randomUUID();
    items.forEach((item) => (item.executionId = executionId));

    const execution = new ChecklistExecution({
      id: executionId,
      missionId,
      templateId: template.id,
      pilotId,
      startedAt: Date.now(),
      status: 'IN_PROGRESS',
      items,
    });

    await this.checklistRepo.saveExecution(execution);
    return execution;
  }
}
