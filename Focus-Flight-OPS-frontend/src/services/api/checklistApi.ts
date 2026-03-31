import apiClient from './apiClient';

export const checklistApi = {
  getTemplates: () => apiClient.get('/checklists/templates'),
  getTemplateByType: (type: string) => apiClient.get(`/checklists/templates/${type}`),
  startExecution: (data: any) => apiClient.post('/checklists/executions', data),
  checkItem: (executionId: string, itemId: string, data: any) =>
    apiClient.patch(`/checklists/executions/${executionId}/items/${itemId}`, data),
  finalizeExecution: (executionId: string) =>
    apiClient.patch(`/checklists/executions/${executionId}/finalize`),
  getByMission: (missionId: string) =>
    apiClient.get(`/checklists/missions/${missionId}`),
};
