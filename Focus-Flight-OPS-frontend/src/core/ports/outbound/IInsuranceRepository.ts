import { InsurancePolicy } from '../../entities';

export interface IInsuranceRepository {
  findById(id: string): Promise<InsurancePolicy | null>;
  findByPilotId(pilotId: string): Promise<InsurancePolicy[]>;
  findActiveByPilotId(pilotId: string): Promise<InsurancePolicy | null>;
  save(policy: InsurancePolicy): Promise<void>;
  update(policy: InsurancePolicy): Promise<void>;
  delete(id: string): Promise<void>;
}
