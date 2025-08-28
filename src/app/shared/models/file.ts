import {SBOM} from './sbom';

export default class File {
  static fileCount = -1;
  sbom: SBOM | null = null;
  format: string;
  schema: string;
  status: FileStatus;
  fileName: string;
  contents: string | null;
  id: number;

  /**
   * creates a new file. Set to loading on launch
   */
  constructor(path?: string) {
    this.status = FileStatus.LOADING;
    this.format = 'n/a';
    this.schema = 'n/a';
    this.contents = null;
    this.fileName = path || 'n/a';
    this.id = File.fileCount;
    File.fileCount -= 1;
  }

  setValid(id: number, contents: string, sbom: SBOM): File {
    this.status = FileStatus.VALID;
    this.contents = contents;
    this.sbom = sbom;
    this.format = sbom.format;
    this.id = id;
    return this;
  }

  setError(): File {
    this.status = FileStatus.ERROR;
    return this;
  }

  removeContents(): File {
    this.contents = null;
    return this;
  }
}

export enum FileStatus {
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  VALID = 'VALID',
}
