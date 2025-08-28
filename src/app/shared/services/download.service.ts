import {Injectable} from '@angular/core';
import {strToU8, zipSync} from 'fflate';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  constructor() {
  }

  Download(fileName: string, content: Blob) {
    const blob = new Blob([content], {type: 'text/plain'});
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();

    window.URL.revokeObjectURL(url);
  }

  DownloadAsZip(files: { [key: string]: string }) {
    const zipData: Record<string, Uint8Array> = {};

    let keys = Object.keys(files);

    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let contents = files[key];

      zipData[key] = strToU8(contents);
    }

    const content = new Blob([zipSync(zipData)], {type: 'application/zip'});
    this.#saveAs(content, 'files.zip');
  }

  #saveAs(blob: Blob, filename: string) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
