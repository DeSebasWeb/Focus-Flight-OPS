import { ChecklistExecution } from '../../../core/entities';
import { IChecklistRepository } from '../../../core/ports/outbound';
import { ChecklistIncompleteError } from '../../../core/errors';

export class FinalizeChecklistUseCase {
  constructor(private readonly checklistRepo: IChecklistRepository) {}

  async execute(executionId: string): Promise<ChecklistExecution> {
    const execution = await this.checklistRepo.findExecutionById(executionId);
    if (!execution) {
      throw new Error(`Checklist execution ${executionId} not found`);
    }

    if (execution.props.status !== 'IN_PROGRESS') {
      throw new Error(`Checklist already finalized with status: ${execution.props.status}`);
    }

    const template = await this.checklistRepo.findTemplateByType(
      (await this.checklistRepo.findAllActiveTemplates()).find(
        (t) => t.id === execution.props.templateId,
      )!.props.type,
    );

    if (!template) {
      throw new Error(`Template ${execution.props.templateId} not found`);
    }

    const criticalItemIds = template.criticalItems.map((item) => item.id);
    const finalized = execution.finalize(criticalItemIds);

    if (finalized.props.status === 'FAILED') {
      const uncheckedCritical = criticalItemIds.filter(
        (id) => !execution.props.items.find((item) => item.templateItemId === id)?.isChecked,
      );
      throw new ChecklistIncompleteError(template.props.nameEs, uncheckedCritical.length);
    }

    await this.checklistRepo.updateExecution(finalized);
    return finalized;
  }
}
