import {Component} from '@angular/core';
import {SVIPService} from '../../services/SVIP.service';
import {SbomService} from '../../services/sbom.service';
import {UploadComponent} from 'src/app/features/upload/upload.component';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.css'],
  standalone: false
})
export class ToggleComponent {
  upload: boolean = false;

  constructor(private svipService: SVIPService, private sbomService: SbomService, private uploadComp: UploadComponent) {
  }

  browse() {
    this.svipService.browseFiles().then((files: string[]) => {
      if (files === undefined || files === null || files.length === 0) {
        return;
      }

      this.sbomService.AddFiles(files);
    });
  }

  uploadProject() {
    this.uploadComp.generateModal = true;
  }
}
