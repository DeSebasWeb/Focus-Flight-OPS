import { ChecklistTemplate, ChecklistExecution } from '../../entities';
import { ChecklistType } from '../../enums';

export interface IChecklistRepository {
  findTemplateByType(type: ChecklistType): Promise<ChecklistTemplate | null>;
  findAllActiveTemplates(): Promise<ChecklistTemplate[]>;

  findExecutionById(id: string): Promise<ChecklistExecution | null>;
  findExecutionsByMissionId(missionId: string): Promise<ChecklistExecution[]>;
  saveExecution(execution: ChecklistExecution): Promise<void>;
  updateExecution(execution: ChecklistExecution): Promise<void>;
}
