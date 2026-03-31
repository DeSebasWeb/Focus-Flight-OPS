export interface IFileStorage {
  saveFile(data: string | ArrayBuffer, fileName: string, directory: string): Promise<string>;
  readFile(uri: string): Promise<string | null>;
  deleteFile(uri: string): Promise<void>;
  fileExists(uri: string): Promise<boolean>;
}
