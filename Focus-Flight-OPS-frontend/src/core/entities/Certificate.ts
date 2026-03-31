export interface CertificateProps {
  id: string;
  pilotId: string;
  type: 'COMPETENCY' | 'MEDICAL' | 'TRAINING';
  issuingAuthority: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  documentUri?: string;
  isValid: boolean;
  createdAt: number;
}

export class Certificate {
  readonly props: CertificateProps;

  constructor(props: CertificateProps) {
    this.props = Object.freeze({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get isExpired(): boolean {
    return new Date(this.props.expiryDate).getTime() < Date.now();
  }

  get daysUntilExpiry(): number {
    const diff = new Date(this.props.expiryDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  get isExpiringWithin30Days(): boolean {
    return this.daysUntilExpiry <= 30 && this.daysUntilExpiry > 0;
  }

  get isCurrentlyValid(): boolean {
    return this.props.isValid && !this.isExpired;
  }

  invalidate(): Certificate {
    return new Certificate({
      ...this.props,
      isValid: false,
    });
  }
}
