import { Pilot } from '../../entities';

export interface IPilotRepository {
  findById(id: string): Promise<Pilot | null>;
  findByDocumentNumber(documentNumber: string): Promise<Pilot | null>;
  save(pilot: Pilot): Promise<void>;
  update(pilot: Pilot): Promise<void>;
}
