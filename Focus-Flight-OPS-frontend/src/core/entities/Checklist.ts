import { ChecklistType } from '../enums';

export interface ChecklistTemplateItem {
  id: string;
  templateId: string;
  orderIndex: number;
  textEs: string;
  isCritical: boolean;
  requiresPhoto: boolean;
  category?: 'STRUCTURAL' | 'BATTERY' | 'SENSORS' | 'PROPULSION' | 'CONTROL' | 'SAFETY';
}

export interface ChecklistTemplateProps {
  id: string;
  type: ChecklistType;
  version: number;
  nameEs: string;
  isActive: boolean;
  items: ChecklistTemplateItem[];
}

export class ChecklistTemplate {
  readonly props: ChecklistTemplateProps;

  constructor(props: ChecklistTemplateProps) {
    this.props = Object.freeze({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get criticalItems(): ChecklistTemplateItem[] {
    return this.props.items.filter((item) => item.isCritical);
  }

  get totalItems(): number {
    return this.props.items.length;
  }
}
