import { Certificate } from '../../entities';

export interface ICertificateRepository {
  findById(id: string): Promise<Certificate | null>;
  findByPilotId(pilotId: string): Promise<Certificate[]>;
  findValidByPilotId(pilotId: string): Promise<Certificate[]>;
  save(certificate: Certificate): Promise<void>;
  update(certificate: Certificate): Promise<void>;
  delete(id: string): Promise<void>;
}
