import { ChecklistTemplate, ChecklistExecution } from '../../entities';
import { ChecklistType } from '../../enums';

export interface ISafetyProtocol {
  getChecklistTemplate(type: ChecklistType): Promise<ChecklistTemplate>;
  startChecklist(missionId: string, templateId: string, pilotId: string): Promise<ChecklistExecution>;
  checkItem(executionId: string, templateItemId: string, note?: string, photoUri?: string): Promise<ChecklistExecution>;
  uncheckItem(executionId: string, templateItemId: string): Promise<ChecklistExecution>;
  finalizeChecklist(executionId: string): Promise<ChecklistExecution>;
  abortChecklist(executionId: string): Promise<ChecklistExecution>;
  getMissionChecklists(missionId: string): Promise<ChecklistExecution[]>;
  canProceedToNextPhase(missionId: string, currentPhase: ChecklistType): Promise<boolean>;
}
