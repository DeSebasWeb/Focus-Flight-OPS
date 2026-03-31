import { Pilot, PilotProps, Certificate, CertificateProps, InsurancePolicy, InsurancePolicyProps } from '../../entities';

export interface IPilotProfile {
  createProfile(props: Omit<PilotProps, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pilot>;
  updateProfile(id: string, updates: Partial<PilotProps>): Promise<Pilot>;
  getProfile(id: string): Promise<Pilot>;

  uploadCertificate(props: Omit<CertificateProps, 'id' | 'createdAt'>): Promise<Certificate>;
  getCertificates(pilotId: string): Promise<Certificate[]>;
  checkCertificateExpiry(pilotId: string): Promise<Certificate[]>;

  uploadInsurance(props: Omit<InsurancePolicyProps, 'id' | 'createdAt'>): Promise<InsurancePolicy>;
  getActiveInsurance(pilotId: string): Promise<InsurancePolicy | null>;
}
