/**@author Justin Jantzi, Tina DiLorenzo*/

import { Injectable } from '@angular/core';
import { ClientService } from './client.service';
import { IpcRenderer } from 'electron';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { SBOM } from '../models/sbom';

@Injectable({
  providedIn: 'root',
})
export class SVIPService {
  private ipc!: IpcRenderer;

  constructor(private client: ClientService) {
    if (window.require) {
      try {
        this.ipc = window.require('electron').ipcRenderer;
      } catch (e) {
        console.log(e);
      }
    } else {
      console.warn('App not running inside Electron!');
    }
  }

  //#region SVIP functions
  /**
   * Upload an SBOM in the database for future use
   * @param fileName File name
   * @param contents contents of the sbom
   */
  uploadSBOM(fileName: string, contents: string): Observable<number> {
    return this.client.post('sboms', {
      contents: contents,
      fileName: fileName,
    }) as Observable<number>;
  }

  /**
   * Get an SBOM in the database
   * @param id SBOM id
   */
  getSBOM(id: number): Observable<SBOM> {
    const params = new HttpParams().set('id', id);
    return this.client.get('sbom', params) as Observable<SBOM>;
  }

  /**
   * Get an SBOM's file contents
   * @param id SBOM id
   */
  getSBOMContents(id: number): Observable<object> {
    return this.client.get('sboms/content', new HttpParams().set('id', id));
  }

  /**
   * Get all sboms IDs in database
   */
  getSBOMS(): Observable<number[]> {
    return this.client.get('sboms') as Observable<number[]>;
  }

  /**
   * Delete an  SBOM in the database
   * @param id SBOM id
   */
  deleteSBOM(id: number): Observable<object> {
    return this.client.delete('sboms', new HttpParams().set('id', id));
  }

  /**
   * Delete an  SBOM in the database
   * @param id SBOM id
   */
  compareSBOMs(ids: number[]) {
    return this.client.post(
      'sboms/compare',
      ids,
      new HttpParams().set('targetIndex', 0)
    );
  }

  /**
   * Merge SBOMs into one SBOM
   * @param ids ids of sboms to merge
   */
  mergeSBOMs(ids: number[]): Observable<number> {
    return this.client.post('sboms/merge', ids) as Observable<number>;
  }

  /**
   * Convert an  SBOM to a new format or schema.
   * @param id SBOM id
   * @param schema SBOM schema
   * @param format SBOM format
   * @param overwrite if false, a new sbom will be crated; else overwritten.
   */
  convertSBOM(
    id: number,
    schema: string,
    format: string,
    overwrite: boolean
  ): Observable<string> {
    //NOTE: The server params are backwards hence why they are reversed here.
    return this.client.put(
      'sboms',
      new HttpParams()
        .set('id', id)
        .set('schema', format)
        .set('format', schema)
        .set('overwrite', overwrite)
    ) as Observable<string>;
  }

  getVex(id: number, format: string, database: string, apiKey: string = '') {
    if (apiKey) this.client.setAPIKey(apiKey);

    return this.client.get(
      'sboms/vex',
      new HttpParams()
        .set('id', id)
        .set('format', format)
        .set('client', database)
    ) as Observable<any>;
  }

  /**
   *  Run metrics on an SBOM (with repair).
   * @param id SBOM id
   */
  gradeSBOM(id: number): Observable<string> {
    return this.client.get(
      'sboms/repair/statement',
      new HttpParams().set('id', id)
    ) as Observable<string>;
  }

  async repairSBOM(sbom: number, fix: {[id: number]: any[]}) {
    return new Promise(async(resolve, reject) => {
      this.client.get('sboms/repair',
        new HttpParams().set('id', sbom)
        .set('repairStatement', JSON.stringify(fix))
        .set('overwrite', true)).subscribe((data) => {
          if(data) {
            return resolve(data);
          }
          return reject(false);
        })
    })
  }


  //#endregion
  //#region Electron
  /**
   *  Get file information from filepath
   * @param path File path
   */
  getFileData(path: string) {
    return this.ipc.invoke('getFileData', path);
  }

  getOSITools(): Observable<string[]> {
    return this.client.get('generators/osi/tools') as Observable<string[]>;
  }

  /**
   * Open file explorer and prompts user to upload fiels
   * @param id SBOM id
   */
  browseFiles() {
    return this.ipc.invoke('selectFiles');
  }

  async getProjectDirectory() : Promise<any> {
    return new Promise(async(resolve, reject) => {
        await this.ipc.invoke('getZipFromFolder').then((value: any) => {
          return resolve(true);
        }).catch(() => {
          return reject(false);
        })
    })
  }

  async zipFileDirectory(data: any) {
    return new Promise(async(resolve, reject) => {
      await this.ipc.invoke('zipDirectory').then((value: any) => {
        return resolve(value);
      }).catch(() => {
        return reject(false);
      })
  })
  }

  async generateFile(file: any, projectName: string, schema: string, format: string, type: string, osiTools: string[]) {
    return new Promise(async(resolve, reject) => {
      let formData = new FormData();

      formData.append('projectName', projectName);
      formData.append('schema', schema);
      formData.append('format', format);

      if(type.toLowerCase() === 'osi')
        formData.append('toolNames', JSON.stringify(osiTools));
      else
        formData.append('zipFile', new File([file], 'temp.zip'));

      let params = new HttpParams();

      this.client.postFile('generators/' + type.toLowerCase(), formData, params).subscribe((data) => {
        if(data) {
          return resolve(data);
        }

        return reject(false);
      })
    });
  }

  async uploadProject(file: any, type: string) {
    return new Promise(async(resolve, reject) => {
      let formData = new FormData();
      const fileToSend = (file instanceof File) ? file : new File([file], 'temp.zip');
      formData.append('project', fileToSend);

      let params = new HttpParams();

      this.client.postFile('generators/' + type.toLowerCase() + "/project", formData, params).subscribe((data) => {
        if(data) {
          return resolve(data);
        }

        return reject(false);
      })
    });
  }
  //#endregion
}
