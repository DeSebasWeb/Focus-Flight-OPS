export interface InsurancePolicyProps {
  id: string;
  pilotId: string;
  insurerName: string;
  policyNumber: string;
  coverageType: 'RC_EXTRACONTRACTUAL';
  coverageAmountCOP: number;
  startDate: string;
  endDate: string;
  documentUri?: string;
  isActive: boolean;
  createdAt: number;
}

export class InsurancePolicy {
  readonly props: InsurancePolicyProps;

  constructor(props: InsurancePolicyProps) {
    this.props = Object.freeze({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get isExpired(): boolean {
    return new Date(this.props.endDate).getTime() < Date.now();
  }

  get daysUntilExpiry(): number {
    const diff = new Date(this.props.endDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  get isExpiringWithin30Days(): boolean {
    return this.daysUntilExpiry <= 30 && this.daysUntilExpiry > 0;
  }

  get isCurrentlyActive(): boolean {
    const now = Date.now();
    const start = new Date(this.props.startDate).getTime();
    const end = new Date(this.props.endDate).getTime();
    return this.props.isActive && now >= start && now <= end;
  }
}
