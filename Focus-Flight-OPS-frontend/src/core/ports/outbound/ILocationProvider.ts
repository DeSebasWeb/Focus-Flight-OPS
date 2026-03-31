import { Coordinates } from '../../value-objects';

export interface ILocationProvider {
  getCurrentPosition(): Promise<Coordinates>;
  watchPosition(callback: (position: Coordinates) => void): () => void;
}
