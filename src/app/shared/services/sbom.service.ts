import { Injectable } from '@angular/core';
import { SVIPService } from './SVIP.service';
import { PAGES, RoutingService } from './routing.service';
import File, { FileStatus } from '../models/file';
import { SBOM } from '../models/sbom';

@Injectable({
  providedIn: 'root',
})
export class SbomService {
  private sbomSchemas: { [name: string]: boolean } = {};
  private sbomFormat: { [name: string]: boolean } = {};
  public comparison: any;
  private files: { [id: string]: File } = {};

  constructor(
    private SVIPService: SVIPService,
    private routingService: RoutingService
  ) {}

  //#region functionality

  /**
   * Gets sbom by ID
   * @param getSBOM by ID
   */
  addSBOMbyID(id: number) {
    this.SVIPService.getSBOM(id as number).subscribe((sbom: SBOM) => {
      this.SVIPService.getSBOMContents(id as number).subscribe((data: any) => {
        let path = (data as any).fileName;
        let contents = (data as any).contents as string;

        const file = new File(path).setValid(id, contents, sbom);
        this.files[id] = file;
        this.SetSBOMFormat(sbom.format, true);
        if ((sbom as any)['schema']) {
          this.SetSBOMSchema((sbom as any)['schema'], true);
        }
      });
    });
  }

  /**
   * Gets all SBOMS in database and sets up SBOM service
   */
  getAllSBOMs() {
    this.SVIPService.getSBOMS().subscribe((ids: number[]) => {
      if (ids) {
        ids.forEach((id: number) => this.addSBOMbyID(id));
      }
    });
  }

  /**
   * Uploads files and checks to see if they are sboms
   * @param paths file paths
   */
  async AddFiles(paths: string[]) {
    paths.forEach((path) => {
      let randomID = -Math.random().toString() + "-loading";
      // File is loading
      this.files[randomID] = new File(path);
      this.SVIPService.getFileData(path).then((contents: string) => {
        if (contents) {
          this.SVIPService.uploadSBOM(path, contents).subscribe(
            (id: number) => {
              if (id) {
                // Successful upload
                this.SVIPService.getSBOM(id).subscribe((sbom: SBOM) => {
                  delete this.files[randomID];
                  let file = new File(path).setValid(id, contents, sbom);
                  this.files[id] = file;
                  this.SetSBOMFormat(sbom.format, true);
                });
              }
            },
            () => {
              // Failed upload
              this.files[randomID].setError();
            }
          );
        }
      });
    });
  }

  /**
   * Download SBOM file
   *
   */
  downloadSBOM(id: string): Blob {
    const file = this.files[id]?.contents;
    if (file !== null) {
      return new Blob([file as any]);
    }
    throw new Error('File does not exist!');
  }

  /**
   * Compare sboms
   * @param target target sbom, others will be tested against it
   * @param others sboms to compare against target
   */
  CompareSBOMs(targetID: string, others: string[]) {
    let idList: number[] = [];

    for (let i = 0; i < others.length; i++) {
      let other = Number(others[i]);
      idList.push(other);
    }

    idList.unshift(Number(targetID));

    this.SVIPService.compareSBOMs(idList).subscribe((result: any) => {
      this.comparison = result;
    });
  }

  /**
   * Delete file
   * @param: file ID
   */
  deleteFile(id: string) {
    if (id && !isNaN(Number(id))) {
      // TODO: Add error handling for when file cannot be deleted
      this.SVIPService.deleteSBOM(Number(id)).subscribe((deleted: any) => {
        if (deleted) {
          const data = this.routingService.data;
          if (data === id) {
            this.routingService.data = null;
            this.routingService.SetPage(PAGES.NONE);
          }
          delete this.files[id];
        }
      });
    } else {
      delete this.files[id];
    }
  }

  /**
   * Convert sbom from one type to another
   * @param id sbom id
   * @param schema sbom schema
   * @param format file format
   * @param overwrite overwrite or create new sbom
   */
  ConvertSBOM(
    id: string,
    schema: string,
    format: string,
    overwrite: boolean
  ) {
    this.SVIPService.convertSBOM(Number(id), schema, format, overwrite).subscribe(
      (result: string) => {
        if (result) {
          this.addSBOMbyID(Number(result));

          if(overwrite)
            delete this.files[id];
        }
      }
    );
  }
  //#endregion

  //#region SBOM schemas
  /**
   * Gets all SBOM schema helpers
   */
  getSBOMschemas() {
    return this.sbomSchemas;
  }

  /**
   * Set valid SBOM formats for filters
   * @param schema SBOM schema
   * @param value true if shown; false if filtered out
   */
  SetSBOMSchema(schema: string, value: boolean) {
    this.sbomSchemas[schema] = value;
  }

  /**
   * Gets schema of sbom
   * @param id sbom to check for
   */
  GetSBOMSchema(id: string) {
    return (this.files[id] as any).schema;
  }

  //#region SBOM format
  /**
   * Gets all SBOM format helpers
   */
  getSBOMformat(){
    return this.sbomFormat;
  }

  /**
   * Set valid SBOM formats for filters
   * @param format SBOM format
   * @param value true if shown; false if filtered out
   */
  SetSBOMFormat(format: string, value: boolean) {
    this.sbomFormat[format] = value;
  }

  /**
   * Gets schema of sbom
   * @param id sbom to check for
   */
  GetSBOMFormat(id: string) {
    return (this.files[id] as any).format;
  }

  //#endregion

  //#region SBOM generic Getters
  /**
   * Gets all SBOM file names
   */
  getSBOMNames() {
    return Object.keys(this.files);
  }

  /**
   * Gets sbom file
   * @param id sbom id
   */
  GetSBOMInfo(id: string) {
    return this.files[id];
  }

  /**
   * Gets SBOMS matching requested status
   * @param status file status
   */
  GetSBOMsOfStatus(status: FileStatus) {
    return Object.keys(this.files).filter(
      (x: any) => this.files[x].status === status
    );
  }

  /**
   * Gets sbom file name without the path
   * @param path sbom path
   */
  getSBOMAliasByPath(path: string) {
    const lastBackslashIndex = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));

    if (lastBackslashIndex !== -1) {
      return path.substring(lastBackslashIndex + 1);
    }
    return path;
  }

  /***
   * Gets sbom file name by index in sbom list
   */
  getSBOMAliasByID(id: string) {
    if(this.files[id].fileName === undefined)
      return "";

    let path = this.files[id].fileName;
    const lastBackslashIndex = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));

    if (lastBackslashIndex !== -1) {
      return path.substring(lastBackslashIndex + 1);
    }
    return path;
  }


  //#endregion
}
