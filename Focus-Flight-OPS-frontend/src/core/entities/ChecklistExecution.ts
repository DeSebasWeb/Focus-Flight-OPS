export type ChecklistExecutionStatus = 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'ABORTED';

export interface ChecklistExecutionItemProps {
  id: string;
  executionId: string;
  templateItemId: string;
  isChecked: boolean;
  checkedAt?: number;
  note?: string;
  photoUri?: string;
}

export interface ChecklistExecutionProps {
  id: string;
  missionId: string;
  templateId: string;
  pilotId: string;
  startedAt: number;
  completedAt?: number;
  isPassed?: boolean;
  status: ChecklistExecutionStatus;
  items: ChecklistExecutionItemProps[];
}

export class ChecklistExecution {
  readonly props: ChecklistExecutionProps;

  constructor(props: ChecklistExecutionProps) {
    this.props = Object.freeze({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get completedItemsCount(): number {
    return this.props.items.filter((item) => item.isChecked).length;
  }

  get progressPercent(): number {
    if (this.props.items.length === 0) return 100;
    return Math.round((this.completedItemsCount / this.props.items.length) * 100);
  }

  checkItem(
    templateItemId: string,
    note?: string,
    photoUri?: string,
  ): ChecklistExecution {
    const updatedItems = this.props.items.map((item) =>
      item.templateItemId === templateItemId
        ? { ...item, isChecked: true, checkedAt: Date.now(), note, photoUri }
        : item,
    );
    return new ChecklistExecution({ ...this.props, items: updatedItems });
  }

  uncheckItem(templateItemId: string): ChecklistExecution {
    const updatedItems = this.props.items.map((item) =>
      item.templateItemId === templateItemId
        ? { ...item, isChecked: false, checkedAt: undefined, note: undefined, photoUri: undefined }
        : item,
    );
    return new ChecklistExecution({ ...this.props, items: updatedItems });
  }

  allCriticalItemsChecked(criticalItemIds: string[]): boolean {
    return criticalItemIds.every((id) =>
      this.props.items.find((item) => item.templateItemId === id)?.isChecked,
    );
  }

  finalize(criticalItemIds: string[]): ChecklistExecution {
    const allCriticalPassed = this.allCriticalItemsChecked(criticalItemIds);
    return new ChecklistExecution({
      ...this.props,
      completedAt: Date.now(),
      isPassed: allCriticalPassed,
      status: allCriticalPassed ? 'PASSED' : 'FAILED',
    });
  }

  abort(): ChecklistExecution {
    return new ChecklistExecution({
      ...this.props,
      completedAt: Date.now(),
      isPassed: false,
      status: 'ABORTED',
    });
  }
}
