import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PAGES, RoutingService} from '../../services/routing.service';
import {SbomService} from '../../services/sbom.service';
import {FileStatus} from '../../models/file';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  standalone: false
})
export class MenuComponent {
  @Input() text: string = '';
  @Input() data: string = '';
  @Input() opened: boolean = false;
  @Output() close = new EventEmitter<Boolean>();
  sbomValid: boolean = false;

  constructor(private routing: RoutingService, private sbomService: SbomService) {
  }

  ngOnInit() {
    this.checkSbomValidity();
  }

  checkSbomValidity() {
    const sbomInfo = this.GetSBOMInfo(this.data);
    this.sbomValid = sbomInfo && sbomInfo.status === FileStatus.VALID;
  }

  RemoveFile() {
    this.sbomService.deleteFile(this.data);
    this.opened = false;
  }

  GetSBOMInfo(file: string) {
    return this.sbomService.GetSBOMInfo(file);
  }

  ViewOne() {
    this.routing.data = this.data;
    this.routing.SetPage(PAGES.VIEW);
  }

  DownloadOne() {
    const sbomInfo = this.GetSBOMInfo(this.data);
    const name = sbomInfo.fileName;
    const sbom = this.sbomService.downloadSBOM(this.data);

    if (sbom && sbomInfo.status !== FileStatus.ERROR) {
      this.sbomValid = true;

      const url = URL.createObjectURL(sbom);
      const link = document.createElement('a');
      link.href = url;
      link.download = name as string;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      this.sbomValid = false;
    }
  }

  Close() {
    this.opened = false;
  }

  openDeleteModal() {
    this.opened = true;
  }
}
