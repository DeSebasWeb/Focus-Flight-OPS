import { ChecklistExecution } from '../../../core/entities';
import { IChecklistRepository } from '../../../core/ports/outbound';

export class CompleteChecklistItemUseCase {
  constructor(private readonly checklistRepo: IChecklistRepository) {}

  async execute(
    executionId: string,
    templateItemId: string,
    note?: string,
    photoUri?: string,
  ): Promise<ChecklistExecution> {
    const execution = await this.checklistRepo.findExecutionById(executionId);
    if (!execution) {
      throw new Error(`Checklist execution ${executionId} not found`);
    }

    if (execution.props.status !== 'IN_PROGRESS') {
      throw new Error('Cannot modify a finalized checklist');
    }

    const updated = execution.checkItem(templateItemId, note, photoUri);
    await this.checklistRepo.updateExecution(updated);
    return updated;
  }
}
