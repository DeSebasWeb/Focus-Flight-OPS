export interface INotificationService {
  scheduleLocal(title: string, body: string, triggerAtMs: number): Promise<string>;
  cancelScheduled(notificationId: string): Promise<void>;
  showImmediate(title: string, body: string): Promise<void>;
}
