import {Component, HostListener, OnInit} from '@angular/core';
import {SbomService} from 'src/app/shared/services/sbom.service';
import {PAGES, RoutingService} from 'src/app/shared/services/routing.service';
import {FileStatus} from 'src/app/shared/models/file';
import {SVIPService} from 'src/app/shared/services/SVIP.service';
import {EventTypes} from 'src/app/shared/models/event-types';
import {ToastService} from 'src/app/shared/services/toast.service';
import {DownloadService} from 'src/app/shared/services/download.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
  host: {
    '(window:resize)': 'onResize($event)'
  },
  standalone: false
})
export class UploadComponent implements OnInit {
  public filterSearch: string = '';
  public downloadModal: boolean = false;
  public deleteModal: boolean = false;
  public convertModal: boolean = false;
  public mergeModal: boolean = false;
  public generateModal: boolean = false;
  public checkboxes: boolean[] = [];
  public collapsed: boolean = false;

  title = 'angular-bootstrap-toast-service';

  EventTypes = EventTypes;

  public convertOptions: {
    schema: string;
    format: string;
    overwrite: boolean;
  } = {
    schema: '',
    format: '',
    overwrite: true,
  };

  public convertChoices: { [key: string]: string[] } = {
    'CDX14': ['JSON', 'XML'],
    'SPDX23': ['TAGVALUE', 'JSON'],
  }
  public compareModal: boolean = false;

  protected sortingOptions: { [type: string]: boolean } = {
    NAME: true,
    FORMAT: true,
  };

  private selectedSorting: SORT_OPTIONS = SORT_OPTIONS.NAME;

  constructor(
    private sbomService: SbomService,
    public routing: RoutingService,
    private toastService: ToastService,
    private svipService: SVIPService,
    private downloadService: DownloadService
  ) {
  }

  ngOnInit() {
    this.sbomService.getAllSBOMs();
  }

  /**
   *  Prompts user to select files and tries to upload them
   */
  browse() {
    this.svipService.browseFiles().then((files: string[]) => {
      if (files === undefined || files === null || files.length === 0) {
        return;
      }

      this.sbomService.AddFiles(files);
    });
  }

  uploadProject() {
    this.generateModal = true;
  }

  /**
   *  Checks if any files have been uploaded
   */
  ContainsFiles() {
    this.sbomService.GetSBOMsOfStatus(FileStatus.VALID).length > 0 ||
    this.sbomService.GetSBOMsOfStatus(FileStatus.LOADING).length > 0;
  }

  GetSelected() {
    const checkboxes = document.querySelectorAll('.sbom-checkbox');
    let selected: string[] = [];

    for (let i = 0; i < checkboxes.length; i++) {
      const checkbox = checkboxes[i] as HTMLInputElement;
      if (checkbox.checked && !checkbox.disabled && checkbox.value != 'null') {
        selected.push(checkbox.value);
      }
    }

    return selected;
  }

  GetAllFiles() {
    return this.sbomService.getSBOMNames();
  }

  openConvert() {
    this.convertModal = true;
  }

  /**
   *  Gets uploaded files
   */
  GetSBOMsOfType(statusString: string) {
    let status = FileStatus[statusString as keyof typeof FileStatus];

    if (this.selectedSorting === SORT_OPTIONS.NAME)
      return this.sbomService
        .GetSBOMsOfStatus(status)
        .sort((a: string, b: string) => {
          let aFormat = this.sbomService.GetSBOMInfo(a).fileName;
          let bFormat = this.sbomService.GetSBOMInfo(b).fileName;

          return this.sortingOptions[SORT_OPTIONS.NAME]
            ? aFormat.localeCompare(bFormat)
            : bFormat.localeCompare(aFormat);
        });

    return this.sbomService
      .GetSBOMsOfStatus(status)
      .sort((a: string, b: string) => {
        let aFormat = this.sbomService.GetSBOMFormat(a);
        let bFormat = this.sbomService.GetSBOMFormat(b);

        return this.sortingOptions[SORT_OPTIONS.FORMAT]
          ? aFormat.localeCompare(bFormat)
          : bFormat.localeCompare(aFormat);
      });
  }

  GetSBOMInfo(file: string) {
    return this.sbomService.GetSBOMInfo(file);
  }

  GetSBOMSchemas() {
    return this.sbomService.getSBOMschemas();
  }

  GetSBOMFormat() {
    return this.sbomService.getSBOMformat();
  }

  ValidSBOMSchema(path: string) {
    return this.GetSBOMSchemas()[this.sbomService.GetSBOMInfo(path).schema];
  }

  ValidSBOMFormat(path: string) {
    return this.GetSBOMFormat()[this.sbomService.GetSBOMInfo(path).format];
  }

  SbomFormatFilterChange(event: any) {
    this.sbomService.SetSBOMFormat(event.name, event.value);
  }

  /**
   * Removes file from uploaded files
   * @param file file to remove
   */
  RemoveFile(id: string) {
    if (this.routing.GetPage() === PAGES.VIEW && this.routing.data === id) {
      this.routing.SetPage(PAGES.NONE);
      this.routing.data = undefined;
    }
    this.sbomService.deleteFile(id);
  }

  setAllSelected(event: any) {
    let value = event.target.checked;
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    for (let i = 0; i < checkboxes.length; i++) {
      const checkbox = checkboxes[i] as HTMLInputElement;
      checkbox.checked = value;
    }
  }

  UpdateSort(type: string) {
    let sort = SORT_OPTIONS[type as keyof typeof SORT_OPTIONS];

    this.sortingOptions[sort] = !this.sortingOptions[sort];
    this.selectedSorting = sort;
  }

  DeleteSelected() {
    this.GetSelected().forEach((file) => {
      this.RemoveFile(file);
    });

    this.deleteModal = false;
  }

  CheckForErroredFiles() {
    const selectedFiles = this.GetSelected();
    const hasErroredFiles = selectedFiles.filter(
      (sbom) => this.GetSBOMInfo(sbom).status === FileStatus.ERROR
    ).length;

    if (hasErroredFiles) {
      this.showToast(
        'Invalid File Type',
        'Cannot download invalid Files',
        EventTypes.Error
      );
      return true;
    }
    return false;
  }

  DownloadSelected() {
    if (this.CheckForErroredFiles()) {
      return;
    }
    const selectedFiles = this.GetSelected();

    if (selectedFiles.length > 1) {
      this.DownloadSelectedAsZip();
    } else {
      const file = selectedFiles[0];
      this.downloadFile(file);
    }
  }

  DownloadSelectedAsZip() {
    if (this.CheckForErroredFiles()) {
      return;
    }
    const selectedFiles = this.GetSelected();
    let files: any = {};

    for (let i = 0; i < selectedFiles.length; i++) {
      const name = selectedFiles[i];

      let path = this.getAlias(name);

      if (!path)
        path = '';

      const file = this.GetSBOMInfo(name);

      files[path] = file.contents ? file.contents : '';
    }

    this.downloadService.DownloadAsZip(files);
  }

  /**
   * Get SBOM filename
   */
  getAlias(sbom: string) {
    return this.sbomService.getSBOMAliasByID(sbom);
  }

  /**
   * Handles the file drop event
   * @param event The drop event
   */
  @HostListener('document:drop', ['$event'])
  onDocumentDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.onFileDrop(event);
  }

  /**
   * Handles the drag over event
   * @param event The drag over event
   */
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    // Add any visual indication for the drag over event (e.g., highlighting the dropzone)
  }

  /**
   * Handles the drag leave event
   * @param event The drag leave event
   */
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    // Remove any visual indication for the drag leave event
  }

  /**
   * Handles the file drop event
   * @param event The drop event
   */
  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const filePaths = Array.from(files).map((file: any) => (file.path as string));
      this.sbomService.AddFiles(filePaths);
    }
  }

  onResize(event: any) {
    if (event.target.innerWidth > 1000)
      this.collapsed = false;
  }

  ClearSearch() {
    this.filterSearch = '';
    const searchInput = document.querySelector(
      'input[name="search"]'
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
    // Re-enable all formats and schemas so nothing stays hidden
    Object.keys(this.GetSBOMFormat()).forEach((key: string) => this.sbomService.SetSBOMFormat(key, true));
    Object.keys(this.GetSBOMSchemas()).forEach((key: string) => this.sbomService.SetSBOMSchema(key, true));
  }

  UpdateSearch(event: any) {
    this.filterSearch = event.target.value;
  }

  merge() {
    if (this.CheckForErroredFiles()) return;
    this.mergeModal = true;
  }

  GetFilter() {
    return this.filterSearch;
  }

  ViewSBOM(sbom: string) {
    this.routing.SetPage(PAGES.VIEW);
    this.routing.data = this.sbomService.GetSBOMInfo(sbom);
  }

  SetPageIfOneSelected(page: PAGES) {
    let selected = this.GetSelected();

    if (selected.length !== 1) return;

    this.routing.SetPage(page);
    this.routing.data = this.sbomService.GetSBOMInfo(selected[0]);
  }

  sbomsRequiredMessage(amount: number, orMore: boolean) {
    const title = `Invalid SBOM Selection`;
    const message = `${amount}${orMore ? ' or more ' : ' '} SBOM${
      orMore ? 's are' : ' is'
    } required to perform this action`;
    this.showToast(title, message, EventTypes.Error);
  }

  showToast(title: string, message: string, type: EventTypes) {
    switch (type) {
      case EventTypes.Error:
        this.toastService.showErrorToast(title, message);
        break;
      case EventTypes.Warning:
        this.toastService.showWarningToast(title, message);
        break;
    }
  }

  gradeSBOM() {
    let selected = this.GetSelected();

    if (selected.length !== 1) return;

    this.routing.SetPage(PAGES.METRICS);
    this.routing.data = this.sbomService.GetSBOMInfo(selected[0]);
  }

  private downloadFile(file: string) {
    const fileInfo = this.sbomService.GetSBOMInfo(file);
    const content = this.sbomService.downloadSBOM(file);

    if (fileInfo && content) {
      this.downloadService.Download(fileInfo.fileName, content);
    }
  }


}

export enum SORT_OPTIONS {
  NAME = 'NAME',
  SCHEMA = 'SCHEMA',
  FORMAT = 'FORMAT'
}
