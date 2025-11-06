import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SVIPService} from 'src/app/shared/services/SVIP.service';
import {Subject} from 'rxjs';
import {SbomService} from 'src/app/shared/services/sbom.service';
import {ToastService} from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-generate-modal',
  templateUrl: './generate-modal.component.html',
  styleUrls: ['./generate-modal.component.css'],
  standalone: false
})
export class GenerateModalComponent implements OnInit {
  public options: {
    name: string,
    schema: string,
    format: string,
    type: string,
  } = {
    name: '',
    schema: '',
    format: '',
    type: '',
  };

  public choices: { [key: string]: string[] } = {
    'CDX14': ['JSON', 'XML'],
    'SPDX23': ['TAGVALUE', 'JSON'],
  }

  public types: string[] = ['OSI', 'PARSERS'];

  public osiTools: { [name: string]: boolean } = {};

  @Input() opened: boolean = false;
  @Output() close = new EventEmitter<Boolean>();
  public status: GenerationStatus = GenerationStatus.NULL;
  public zippedFileData: any;
  private openedSubject = new Subject<boolean>();

  constructor(private service: SVIPService, private sbomService: SbomService, private toast: ToastService) {
  }

  ngOnInit(): void {
    this.openedSubject.subscribe((value) => {
      if (!value)
        return;

      this.zippedFileData = undefined;
      this.status = GenerationStatus.GENERATING;

      console.log('[SBOM Gen] Starting project directory selection...');
      this.service.getProjectDirectory().then((result) => {
        console.log('[SBOM Gen] Directory selected, starting zip...');
        this.status = GenerationStatus.ZIPPING;

        this.service.zipFileDirectory(result).then((data: any) => {
          console.log('[SBOM Gen] Zip complete, uploading to OSI...', data?.length || 0, 'bytes');
          this.status = GenerationStatus.UPLOADING;

          this.service.uploadProject(data, 'osi').then((tools: any) => {
            console.log('[SBOM Gen] OSI upload complete, tools:', tools);

            tools.forEach((tool: any) => {
              this.osiTools[tool] = true;
            })

            this.zippedFileData = data;
            this.status = GenerationStatus.PROJECT_INFO;

          }).catch((error) => {
            console.error('[SBOM Gen] OSI upload failed:', error);
            this.toast.showErrorToast("SBOM Generation", "Failed to upload project to OSI");
            this.Close();
          })
        }).catch((error) => {
          console.error('[SBOM Gen] Zip failed:', error);
          this.toast.showErrorToast("SBOM Generation", "Failed to zip project");
          this.Close();
        })
      }).catch((error) => {
        console.error('[SBOM Gen] Directory selection cancelled or failed:', error);
        this.Close();
      })
    });
  }

  ngOnChanges(): void {
    this.openedSubject.next(this.opened);
  }

  Generate() {
    if (this.options.schema === '' || this.options.format === '' || this.options.type === '' || this.options.name === '')
      return;

    this.status = GenerationStatus.GENERATING;

    let tools = [];

    for (let key in this.osiTools) {
      if (this.osiTools[key])
        tools.push(key);
    }

    this.service.generateFile(this.zippedFileData,
      this.options.name,
      this.options.schema,
      this.options.format,
      this.options.type,
      tools).then((data: any) => {
      this.sbomService.addSBOMbyID(data);
      this.Close();
    }).catch(() => {
      this.toast.showErrorToast("SBOM Generation", "Failed");
      this.Close();
    })


  }

  OSIToolChange(event: any) {
    this.osiTools[event.name] = event.value;
  }

  // --- Begin: Pre-zipped flow (commented out) ---
  // SelectFolderAndZip() {
  //   this.status = GenerationStatus.ZIPPING;
  //   this.service.getProjectDirectory().then((result) => {
  //     this.service.zipFileDirectory(result).then((data) => {
  //       this.service.uploadProject(data, 'osi').then((tools: any) => {
  //         tools.forEach((tool: any) => {
  //           this.osiTools[tool] = true;
  //         })
  //         this.zippedFileData = data;
  //         this.status = GenerationStatus.PROJECT_INFO;
  //       }).catch(() => { this.Close(); })
  //     }).catch(() => { this.Close(); })
  //   }).catch(() => { this.Close(); })
  // }
  //
  // OnZipFileSelected(event: any) {
  //   const files: FileList = event.target.files;
  //   if (!files || files.length === 0)
  //     return;
  //   const zip = files[0];
  //   this.status = GenerationStatus.GENERATING;
  //   this.service.uploadProject(zip, 'osi').then((tools: any) => {
  //     tools.forEach((tool: any) => {
  //       this.osiTools[tool] = true;
  //     })
  //     this.zippedFileData = zip;
  //     this.status = GenerationStatus.PROJECT_INFO;
  //   }).catch(() => { this.Close(); })
  // }
  // --- End: Pre-zipped flow (commented out) ---


  Close() {
    this.status = GenerationStatus.NULL;
    this.close.emit(true);
  }

}

enum GenerationStatus {
  NULL,
  SELECTING_DIRECTORY,
  ZIPPING,
  PROJECT_INFO,
  GENERATING,
  UPLOADING,
  // SELECTING_SOURCE, // disabled
}
